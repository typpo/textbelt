#!/bin/sh

remove_existing_config () {
    perl -i -0pe 's/^#vagrant-start.*#vagrant-end/ /smg' ~/.ssh/config;

}

add_new_config () {
    echo "#vagrant-start" >> ~/.ssh/config;
    vagrant ssh-config >> ~/.ssh/config;
    echo "#vagrant-end" >> ~/.ssh/config;

    # only the owner should have read/write access
    chmod 600 ~/.ssh/config;
}

# Empty out previous config values
remove_existing_config
# Update ~/.ssh/config with latest data
add_new_config
echo "Added the Vagrant targets in your ~/.ssh/config file"
