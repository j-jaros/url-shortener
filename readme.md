Have you ever dreamed of your own web application to shorten links? Or maybe you just don't trust current link
shortening services?

My url shortener is just for you!

Below you will find a full guide that will allow you to run the service on your server yourself.
If you don't have your own server and still want to test it,
check [shortener.julianjaros.pl](https://shortener.julianjaros.pl/)

### Overview

URL Shortener is a very simple web application that is based on python3 and 2 libraries - flask and pymysql.
URL Shortener allows you to generate a shortened link that, when pasted into a web browser, will open the original page.

### Why should I use URL Shortener?

We may shorten links for many reasons,but the main reasons why we do it are:

- **Aesthetics** - links to most resources/websites provided by tech giants look ugly. By using services such as url
  shortener, you will make your links look aesthetically pleasing.
- **Easy to share** - it's much easier to share and rewrite a shorter link. URL-Shortener has a limit of 65535
  characters per link.
  Which means that you can make a much shorter link from such a long link!

### How can i host URL Shortener myself?

#### Server

You need your own server that can handle python3 and mysql.

- I can personally recommend [mikr.us](https://mikr.us/?r=87ffe216) - a very cheap and stable VPS for small projects
  and learning. However, if you don't want to spend money - you can even use your own computer!

#### Public IP (or no)

If you want your URL Shortener to be publicly available from the Internet, you need a public IP address (v4 or v6) -
with such an address you can easily run the service on your network and share it with the whole world! However, this is
quite a dangerous solution - you may be exposed to many attacks on your network. I will focus on installing URL
Shortener on VPS.

### Installation

>[!IMPORTANT]
> The system on which I will host URL Shortener is Ubuntu server 22.04 - I cannot guarantee that all the
> commands/solutions given below will work on other systems or versions of Ubuntu. Moreover, the following guide assumes
> that this is a fresh installation of the Ubuntu server and it does not have any services installed!

**1. Before we do anything remember to update all preinstalled packages!**
_Greetings, Mr. Dawid! ;)_
>[!CAUTION]

> Remember that if any of the following commands returns an error during execution, you must first solve it and only
> then continue!

```console
sudo apt update
```

Wait until the command completes and proceed. \
Once we download the list of current packages, we can update them

```console
sudo apt upgrade
```

When asked whether to continue, enter "Y" and press enter. \
When the command finishes, restart the system

```console
reboot
```

**2. Create a folder where the Shortener URL will be located**

```console
mkdir /shortener
cd /shortener
```

**3. Clone the repository**

```console
sudo apt install git
git clone https://github.com/j-jaros/url-shortener.git
```

**4. Install the libraries included in `requirements.txt`**
```console
pip install -r requirements.txt
```

**5. Install the database server**

```console
sudo apt install mysql-server
sudo systemctl start mysql.service
```

**6. Create new database** \
Enter the mysql shell

```console
mysql -u root -p
```

Create database, change the authentication type of root user and exit the shell.
>[!WARNING]
> Remember! What I present in the instructions below is EXAMPLE data! If you are an advanced user, please configure all
> services according to security standards. What I present below is the simplest solution that will allow you to run URL
> Shortener!

```mysql
create database shortener;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
FLUSH PRIVILEGES;
exit
```

Import the database file (Remember! We are still in /shortener directory)

```console
mysql -u root -p shortener < shortener.sql
```

**7. Add DNS records in Cloudflare** 
1. Login into your [cloudflare](https://dash.cloudflare.com/login) dashboard.
2. Click on the domain for which you want to update the records
3. Go to `DNS` tab
4. Press `Add record`
5. Set type to `AAAA` (IPv6)
6. In `name`, enter the subdomain from which you want to connect to the Shortener URL (or use @ to select the main domain)
7. In `IPv6 address` enter the ipv6 address of your server
8. Press `Save`

**8. Install and configure proxy server**
>[!IMPORTANT]
> I base this example on a server purchased on mikr.us. Mikr.us does not provide public IPv4 addresses, so I have to use
> an application that will allow me to redirect IPv6 communication to IPv4! This point is not required if you have
> public
> IPv4 or host it on your local network with IPv4 addressing

Install nginx

```console
sudo apt install nginx
```

Make the backup of config file and configure it with config provided below:

```console
cd /etc/nginx
cp nginx.conf nginx.conf.bak
sudo nano nginx.conf
```

/etc/nginx/nginx.config contents:

```shell
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
        # multi_accept on;
}

http {
        server {
         listen [::]:80;
         server_name shortener.julianjaros.pl; # change it to your domain name
         location / {
            proxy_pass http://127.0.0.1:44044; # change it to local IP and port that you use in URL Shortener config.
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $Host;
            proxy_set_header X-Forwarded-Protocol https;
            proxy_set_header X-Real-IP $remote_addr;
        }
        }
}
```

Check the config and restart the service
>[!WARNING]
> Remember! If `nginx -t` gives an error, check the configuration file and correct the errors!

```console
nginx -t
sudo service nginx restart
```

**9. Run the main URL Shortener file** \
Go back to URL Shortener directory and run the file

```console
cd /shortener
python3 main.py
```

_Voila!_ Your own URL Shortener installation is now working! Enter the server address/domain in the browser bar and test
it!