exec 4<>/dev/tcp/www.tianxiaohui.com/80
echo -e "GET /test.html HTTP/1.0\r\nHost: www.tianxiaohui.com\r\n\r\n" >&4
cat <&4
