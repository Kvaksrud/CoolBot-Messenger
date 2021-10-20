# CoolBot

## Dev environemnt
Requires
| Software | Notes |
| -------- | ----- |
| [Docker](https://docs.docker.com/desktop/windows/install/) | Prerequisite: Enable virtualization technology on your CPU and install [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package) (Step 4 and 5) |
| [Node.js](https://nodejs.org/en/download/current/) | Requires version 17.0.x |
| [PHP](https://windows.php.net/download/#php-7.4) | Requires version 7.4.x VC15 x64 Non Thread Safe. Place in C:\php and [add C:\php to PATH](https://www.architectryan.com/2018/03/17/add-to-the-path-on-windows-10/) for your user  |
| [Visual Studio Code](https://code.visualstudio.com/) | Install extension ESlint after VSCode

```
docker run --name "dev-mariadb-10.6.4" -p 127.0.0.1:3306:3306 -e MARIADB_ROOT_PASSWORD=passw0rd -d mariadb:10.6.4
docker run --name "dev-phpmyadmin-latest" -d --link "dev-mariadb-10.6.4:db" -p 127.0.0.1:8081:80 phpmyadmin:latest
```