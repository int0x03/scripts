启动一个长期存活的docker container:
```bash
docker run -d -v /home/supra/work/projects:/projects --restart=always --name  py python tail -f /dev/null
```
