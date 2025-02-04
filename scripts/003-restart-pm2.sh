#!/usr/bin/env bash
APP_ROOT=/home/ec2-user/comap
cd $APP_ROOT
sudo su
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
npm install -g pm2
pm2 delete all
pm2 update
npm run start
pm2 status
