# can use an alternative base image as well
FROM phusion/baseimage:0.9.19

# set your node version, if desired
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs

# install other dependencies
# install a local redis server - per http://redis.io/topics/quickstart
RUN curl -O http://download.redis.io/redis-stable.tar.gz
RUN tar xvzf redis-stable.tar.gz
RUN mv redis-stable /opt/redis-stable
# for access to make
RUN apt-get install -y --reinstall build-essential
RUN cd /opt/redis-stable && make && cd ..
RUN rm redis-stable.tar.gz
RUN mkdir -p /etc/redis
RUN mkdir -p /var/redis
# make customizations to the redis conf as needed
RUN mkdir -p /var/redis/6379
RUN cp /opt/redis-stable/utils/redis_init_script /etc/init.d/redis_6379
RUN sed -i -- 's|daemonize no|daemonize yes|g' /opt/redis-stable/redis.conf
RUN sed -i -- 's|pidfile /var/run/redis.pid|pidfile /var/run/redis_6379.pid|g' /opt/redis-stable/redis.conf
#RUN sed -i -- 's|port 6379|port 8080|g' /opt/redis-stable/redis.conf
#RUN sed -i -- 's|loglevel notice|loglevel debug|g' /opt/redis-stable/redis.conf
RUN sed -i -- 's|logfile ""|logfile /var/log/redis_6379.log|g' /opt/redis-stable/redis.conf
RUN sed -i -- 's|dir ./|dir /var/redis/6379|g' /opt/redis-stable/redis.conf
RUN cp /opt/redis-stable/redis.conf /etc/redis/6379.conf
RUN cp /opt/redis-stable/src/redis-server /usr/local/bin/
RUN cp /opt/redis-stable/src/redis-cli /usr/local/bin/
RUN update-rc.d redis_6379 defaults
# now should be able to start redis with: /etc/init.d/redis_6379 start
# install mutt locally, and install it silently/non-interactively
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get install -y mutt
# install a local nginx for reverse proxy / load balancing, or IP rate limiting?
#RUN apt-get update
#RUN apt-get install -y nginx
# any nginx customizations & running as service setup go here...
# TODO: to enable accurate IP rate limiting, the reverse proxy should be configured to set the `X-Real-IP` header
# install screen - in case want to start services manually in background and switch between them as windows via screen
RUN apt-get install -y screen

# Create app directory
RUN mkdir -p /opt/textbelt/
ENV HOME /opt/textbelt/
WORKDIR /opt/textbelt/
COPY package.json /opt/textbelt/

# Install node.js dependencies
RUN apt-get install -y git
RUN npm install

# Bundle app source
COPY . /opt/textbelt/

# (any) textbelt customizations (to save in docker image)
RUN sed -i -- "s|fromAddress = 'foo@bar.com'|fromAddress = 'me@mydomain.com'|g" /opt/textbelt/lib/text.js
#RUN rm /opt/textbelt/lib/text.js--

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# we'll expose default port and then we can port map with docker at runtime
# no need to customize port in here
EXPOSE 9090

# Use baseimage-docker's init process.
CMD ["/sbin/my_init"]

# now you can use try using the docker image
# - as a server: (then make REST calls to it to send message)
#   run command : docker run --rm -it -p 8080:9090 typpo/textbelt node server/app.js
# - as node.js module/client:
#   run command: docker run --rm -it typpo/textbelt node
#     then copy/paste or type in the code to send message as shown README example
#   or run command: docker run --rm -it typpo/textbelt node pathTo/yourScript.js
#     assuming your script has the code that calls the textbelt module to send message
#   or run command: docker run --rm -it -p 8080:9090 typpo/textbelt bash
#     to be taken to the shell for you to debug and test things out
#     e.g. start/stop/query redis, nginx, test/use mutt
#     run textbelt as module in node shell, node script, or start textbelt server

# NOTE: if you use an external redis server and/or external reverse proxy / load balancer
# you will need to handle the network config and mapping such that the textbelt
# docker container can talk to those servers (which may or may not be in their own docker containers)
