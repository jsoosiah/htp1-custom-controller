# htp1-custom-controller

## Overview
This project is an unofficial web interface to control the Monoprice Monolith HTP-1 written in Vue 3. The goal is a lightweight, responsive, and mobile-friendly interface. 

## Screens

![HTP-1 Home](docs/htp1-home.png)
![HTP-1 Home - Mobile](docs/htp1-home-mobile.png)
![HTP-1 Speakers](docs/htp1-speakers.png)
![HTP-1 Calibratoin](docs/htp1-calibration.png)
![HTP-1 Signal Generator](docs/htp1-sgen.png)
![HTP-1 EQ](docs/htp1-eq.png)
![HTP-1 Inputs](docs/htp1-inputs.png)
![HTP-1 Sound Enhancement](docs/htp1-upmix.png)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Building and Uploading to HTP-1
1. With the latest NodeJS LTS installed on your machine, check out the code and run the following:
```
npm install
npm run build
```
2. This compiles and minifies the project to the `dist` directory. Rename `dist` to `custom`.
3. Upload the `custom` directory to `/opt/olympia/node-red/static` on the HTP-1, removing the old `custom` directory first, if it already exists on the HTP-1.
4. The custom controller can be accessed at `http://{Your HTP-1 IP address}/custom/`.


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
