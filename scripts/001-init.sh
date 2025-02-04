#!/usr/bin/env bash

# I want to make sure that the directory is clean and has nothing left over from
# previous deployments. The servers auto scale so the directory may or may not
# exist.
APP_ROOT=/home/ec2-user/comap
APP_USER=ec2-user
APP_GROUP=ec2-user
if [ -d $APP_ROOT ]; then
    rm -rf $APP_ROOT
fi
mkdir -vp $APP_ROOT
chown -R $APP_USER:$APP_GROUP $APP_ROOT
#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
npm install -g pm2