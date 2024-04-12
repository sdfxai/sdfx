# SDFX installation in standalone mode

## Overview

SDFX is able to work with an already installed instance of ComfyUI.

If you already use ComfyUI on your computer and don't want SDFX to install it
please follow the steps bellow : 

## Dependency

Before proceeding with the installation, ensure that you have [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager) installed as a custom node. This is a mandatory dependency for the proper functioning of SDFXBridgeForComfyUI.

To install the dependency, you can use the following command:

```bash
git clone https://github.com/ltdrdata/ComfyUI-Manager.git
cd ComfyUI-Manager && pip install -r requirements.txt
```

## Install SDFXBridgeForComfyUI

1. Clone the repository SDFXBridgeForComfyUI into your ComfyUI custom_node directory:
    ```bash
    git clone https://github.com/sdfxai/SDFXBridgeForComfyUI.git
    ```

2. Install dependencies using pip:
    ```bash
    cd SDFXBridgeForComfyUI && pip install -r requirements.txt
    ```
OR

you can simply use ComfyUI-Manager to install it

**Don't forget to relaunch your comfyUI instance after the installation**

## Install SDFX in standalone mode 

```bash
git clone https://github.com/sdfxai/sdfx
cd sdfx/src && npm install
```

## Launch SDFX

```bash
npm run dev
```
This will launch the SDFX frontend, which will automatically communicate with your ComfyUI backend (assuming it runs on http://127.0.0.1:8188).

