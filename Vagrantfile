# coding: utf-8
# -*- mode: ruby -*-
# vi: set ft=ruby :

# feel free to rework the vagrant config / build steps as desired...

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.hostname = 'textbelt'
  config.vm.box = 'ubuntu/trusty64'

  config.ssh.forward_agent = true
  config.ssh.insert_key = false
  config.ssh.private_key_path = ['~/.ssh/id_rsa', '~/.vagrant.d/insecure_private_key']
  config.vm.provider 'virtualbox' do |v|
    v.name = config.vm.hostname
    v.memory = 1024
  end

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  config.vm.define 'textbelt' do |textbelt|
    textbelt.vm.network 'public_network'

    # Share an additional folder to the guest VM. The first argument is
    # the path on the host to the actual folder. The second argument is
    # the path on the guest to mount the folder. And the optional third
    # argument is a set of non-required options.
    textbelt.vm.synced_folder '~/textbelt/', '/textbelt'

    # Provider-specific configuration so you can fine-tune various
    # backing providers for Vagrant. These expose provider-specific options.
    # Example for VirtualBox:
    #
    # config.vm.provider "virtualbox" do |vb|
    #   # Display the VirtualBox GUI when booting the machine
    #   vb.gui = true
    #
    #   # Customize the amount of memory on the VM:
    #   vb.memory = "1024"
    # end
    #
    # View the documentation for the provider you are using for more
    # information on available options.

    # Define a Vagrant Push strategy for pushing to Atlas. Other push strategies
    # such as FTP and Heroku are also available. See the documentation at
    # https://docs.vagrantup.com/v2/push/atlas.html for more information.
    # config.push.define "atlas" do |push|
    #   push.app = "YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME"
    # end

    # Enable provisioning with a shell script. Additional provisioners such as
    # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
    # documentation for more information about their specific syntax and use.
    textbelt.vm.provision 'shell', inline: <<-SHELL
     # set your node version, if desired
     curl -sL https://deb.nodesource.com/setup_4.x | bash -
     apt-get install -y nodejs
     # Install node.js dependencies
     apt-get install -y git

     # install other dependencies
     # install a local redis server - per http://redis.io/topics/quickstart
     curl -O http://download.redis.io/redis-stable.tar.gz
     tar xvzf redis-stable.tar.gz
     mv redis-stable /opt/redis-stable
     cd /opt/redis-stable && make && cd ..
     rm redis-stable.tar.gz
     mkdir -p /etc/redis
     mkdir -p /var/redis
     # make customizations to the redis conf as needed
     mkdir -p /var/redis/6379
     cp /opt/redis-stable/utils/redis_init_script /etc/init.d/redis_6379
     sed -i -- 's|daemonize no|daemonize yes|g' /opt/redis-stable/redis.conf
     sed -i -- 's|pidfile /var/run/redis.pid|pidfile /var/run/redis_6379.pid|g' /opt/redis-stable/redis.conf
     #sed -i -- 's|port 6379|port 8080|g' /opt/redis-stable/redis.conf
     #sed -i -- 's|loglevel notice|loglevel debug|g' /opt/redis-stable/redis.conf
     sed -i -- 's|logfile ""|logfile /var/log/redis_6379.log|g' /opt/redis-stable/redis.conf
     sed -i -- 's|dir ./|dir /var/redis/6379|g' /opt/redis-stable/redis.conf
     cp /opt/redis-stable/redis.conf /etc/redis/6379.conf
     cp /opt/redis-stable/src/redis-server /usr/local/bin/
     cp /opt/redis-stable/src/redis-cli /usr/local/bin/
     update-rc.d redis_6379 defaults
     # now should be able to start redis with: /etc/init.d/redis_6379 start
     # install mutt locally, and install it silently/non-interactively
     export DEBIAN_FRONTEND=noninteractive
     apt-get install -y mutt
     # install a local nginx for reverse proxy / load balancing, or IP rate limiting?
     #apt-get update
     #apt-get install -y nginx
     # any nginx customizations & running as service setup go here...
     # TODO: to enable accurate IP rate limiting, the reverse proxy should be configured to set the `X-Real-IP` header
     # install screen - in case want to start services manually in background and switch between them as windows via screen
     apt-get install -y screen
     # Clean up APT when done.
     apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

     # this should give you a VM with textbelt dependencies installed, and a local redis (and perhaps nginx)

     # NOTE: if you use an external redis server and/or external reverse proxy / load balancer
     # you will need to handle the network config and mapping such that the textbelt
     # VM can talk to those servers (which may or may not be in their own VMs)
  SHELL
  end
end
