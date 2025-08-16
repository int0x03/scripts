from fastmcp import FastMCP
from fastmcp.server.middleware import Middleware, MiddlewareContext


### A FastMCP app with tools and resources tagged with "weather" and "news".
### pip install fastmcp
main_mcp = FastMCP("Main App"  )

# the below codes are copied from fastMCP examples with modifications
@main_mcp.tool(tags={"weather"})
def get_weather_forecast(location: str) -> str:
    """Get the weather forecast for a location."""
    return f"Sunny skies for {location} today!"

@main_mcp.resource(uri="weather://forecast", tags={"weather"})
async def weather_data():
    """Return current weather data."""
    return {"temperature": 72, "conditions": "sunny", "humidity": 45, "wind_speed": 5}

@main_mcp.tool(tags={"news"})
def get_news_headlines() -> list[str]:
    """Get the latest news headlines."""
    return [
        "Tech company launches new product",
        "Local team wins championship",
        "Scientists make breakthrough discovery",
    ]

@main_mcp.resource(uri="news://headlines", tags={"news"})
async def news_data():
    """Return latest news data."""
    return {
        "top_story": "Breaking news: Important event happened",
        "categories": ["politics", "sports", "technology"],
        "sources": ["AP", "Reuters", "Local Sources"],
    }

# a middleware to filter tools based on "tags" query parameter
class TagFilteringMiddleware(Middleware):
    async def on_list_tools(self, context: MiddlewareContext, call_next):
        result = await call_next(context)

        tags = context.fastmcp_context.request_context.request.query_params.getlist("tags")
        if not tags: # no tags specified, return all tools
            return result
        if len(tags) == 1 and "," in tags[0]: # if a single tag with multiple values is provided, ex: tags=red,blue
            tags = set(tags[0].split(","))
        else:
            tags = set(tags)

        return [tool for tool in result if bool(tool.tags & tags)] # if the tool's tags intersect with the requested tags

main_mcp.add_middleware(TagFilteringMiddleware()) # add the middleware to the FastMCP app
mp = main_mcp.http_app(path="/mcp") # create a FastAPI app for the FastMCP app

from fastapi import FastAPI
app = FastAPI(lifespan = mp.lifespan)
app.mount("/api", mp)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5050, log_level="info")

    # connect to the mcp with
    # http://localost:5050/api/mcp
    # http://localost:5050/api/mcp?tags=weather
    # http://localost:5050/api/mcp?tags=weather&tags=news
    # http://localost:5050/api/mcp?tags=others
