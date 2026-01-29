# Planium

Planium is a tool for visualizing airplanes, as well as the moon and the sun.
It also allows you to predict 30 seconds before an airplane passes in front of the moon.
Planium makes a rare event accessible: taking a capture of a Moon–aircraft alignment.

## Stacks
- [Vue.js](https://vuejs.org/)
- [vue-cesium](https://zouyaoji.top/vue-cesium/#/en-US)
- [Cesium](https://cesium.com/cesiumjs/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [DaisyUi](https://daisyui.com/)


## Requirements
- Node.js 20.19.0+
- https://nodejs.org/en/download


- Python 3.10+
- https://www.python.org/downloads/

## Prerequisites
- [A Cesium ion account](https://ion.cesium.com) (To Downloads and load assets)
- [A Opensky account](https://opensky-network.org) (To get more credits for the API, follow this [tutorial](https://openskynetwork.github.io/opensky-api/rest.html#oauth2-client-credentials-flow))
- [A Astronomy account](https://astronomyapi.com) (To get the moon phase)
- [A Google app linked to an email](https://myaccount.google.com/apppasswords) (To send emails)

## Upload non-ion assets
1. Download the following assets and upload them to your ion account:
   - [Plane](https://cesium.cdn.prismic.io/cesium/Zv2eybVsGrYSwUFj_Cesium_Air.glb)
2. Go to [your account dashboard](https://ion.cesium.com/assets/?). Drag and drop the model file on this page.
3. Select **3D Model (Convert to glTF)**, then click **Upload**.
4. After it’s done processing, find the **asset ID** by selecting the new asset back in your dashboard and looking under the preview window on the right.

## Create the .env file
1) Create a .env file at the root of the project.
2) Paste the content of the file ".env.example"
3) Replace the variable values with your own.

## Project Setup

```sh
npm run install-all
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
