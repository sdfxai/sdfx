SDFX
=======
<p align="center">
    <a href="https://github.com/sdfxai/sdfx/blob/main/LICENSE.txt">
    <img src="https://img.shields.io/github/license/sdfxai/sdfx" alt="License: AGPL-3.0"/></a>
    <a href="https://discord.gg/aGzRpCsYSz">
      <img src="https://img.shields.io/discord/1178791765382275184?logo=discord" alt="chat on Discord">
    </a>
    <a href="https://t.me/sdfxai">
      <img src="https://img.shields.io/badge/telegram-%E2%9D%A4%EF%B8%8F-252850?style=plastic&logo=telegram" alt="chat on Telegram">
    </a>
    <br>
    <a href="#why">Features</a> |
    <a href="#screenshots">Screenshots</a> |
    <a href="#sdfx-application-json-structure-guide">SDFX App Guide</a> |
    <a href="#installation">Installation</a> |
    <a href="#run">Run</a>
</p>

The ultimate no-code platform to build and share AI apps with beautiful UI.

Join our [Discord Server](https://discord.gg/C3GVetwxnU) for latest news and updates.
 
-----------
![SDFX Screenshot](/docs/static/screen-sdfx.png)

SDFX enables the creation of straightforward user interfaces for intricate workflows. An SDFX application combines a Comfy workflow with a user interface. The JSON that describes the workflow is enriched with extra meta information about the application and its author, as well as the association between UI components and node widgets.

**[Features](#why)**<br>
**[Screenshots](#screenshots)**<br>
**[SDFX Application JSON Structure Guide](#sdfx-application-json-structure-guide)**<br>
**[Installation](#installation)**<br>
**[Run](#run)**<br>
**[Installation for users already using ComfyUI Locally](#installation-for-users-already-using-comfyui-locally)**<br>

## Why?

This project was originally created to meet the needs of users from A1111 (form based UI) and ComfyUI (graph-node based), which are two communities with differing visions. With SDFX, we aimed to merge the benefits of both worlds, without the drawbacks. What SDFX allows, for example, is the creation of complex graphs (as one would do on ComfyUI), but with an overlay of a simpler, high-level UI (such as a form-based interface, with an incredible UI). Thus, in theory, someone could recreate A1111 with SDFX and share the JSON online.

This is an initial draft, there is still much to do (mostly the App Creator that will be released soon). Some had lost faith in us, even calling us vaporware. The reality, as you will see by browsing the source code, is that SDFX required a considerable amount of work. It was made by a solo developer, and now the team is growing. We tried to do things right, focusing solely on what we do best: UIs and product design with a modern frontend stack. Therefore, we rely 100% on Comfy's backend, making SDFX fully compatible with ComfyUI. However, installing ComfyUI is not necessary, as everything is abstracted. We also made an effort to simplify the installation process; in most cases, you will only need to double-click on setup.bat / setup.sh and follow the wizard.

We hope you will like it, and it's with great pleasure that we share our vision and this repo with you, hoping it will pave the way for many contributions from you, to further the advancement of the open-source AI space.

### Features
- Build and share user-friendly apps on top of complex workflows
- 100% compatible with ComfyUI and all its features
- Can work with your existing Comfy installation (with our SDFXBridgeForComfy custom node)
- LiteGraph almost refactored from scratch in typescript
- Animated graph navigation
- Node bookmarks and advanced graph search
- Lightning fast UI instanciation and beautiful high-level components (450x faster than Gradio)
- UI Debugger (rudimentary for now)
- Native Custom Nodes Manager (thanks to Dr.Lt.Data)
- Export and share apps and templates (group nodes export soon)
- Advanced layer-based image and mask editor (WIP)
- Advanced checkpoint picker and gallery
- Advanced input image picker
- Modern and ultra fast frontend stack (vitejs, vuejs, electron)
- Compiles as a native app (Windows, Linux, Mac) or as a webapp
- Extremely easy to maintain and add new features

### Screenshots

### Graph view
![SDFX Screenshot](/docs/static/screen-graph-view.png)

### App view
![SDFX Screenshot](/docs/static/screen-app-view2.png)| ![SDFX Screenshot](/docs/static/screen-app-view.png) |
|--|--|


### Prompt Timeline Component
![SDFX Screenshot](/docs/static/screen-timeline.png)

### UI Debugger
![SDFX Screenshot](/docs/static/screen-interface.png)

### Node Bookmarks
![SDFX Screenshot](/docs/static/screen-bookmarks.png)

### Node Manager
![SDFX Screenshot](/docs/static/screen-node-manager.png)

## SDFX Application JSON Structure Guide

Welcome to the JSON structure guide for SDFX applications. The following is a comprehensive overview for developers looking to understand and utilize the JSON format for creating user-friendly UI with SDFX. Our aim is to ensure clarity and ease of use, so you can integrate and exchange SDFX apps with confidence.


### Basic JSON structure of a SDFX app:

```json
{
  "name": "SDFX Timeline SD15",
  "meta": {},
  "type": "sdfx",
  "mapping": {
    "leftpane": [],
    "mainpane": [],
    "rightpane": []
  },
  "version": 0.4,
  "last_node_id": 287,
  "last_link_id": 569,
  "nodes": [],
  "links": [],
  "groups": [],
  "config": {},
  "extra": {}
}
```

### Application Name

- `name`: The name you assign to your application.

### Meta Information

- `meta`: This key houses essential details about your application, for instance:

```markdown
- `version`: "0.4.1"
- `description`: "Timeline for SD15"
- `icon`: null (This should be updated with a link to a 512x512 image, or a base64 URL)
- `keywords`: "timeline, SD15, upscaler, LCM"
- `author`: "SDFX"
- `license`: "MIT"
- `url`: "https://sdfx.ai"
```

### Application Type

- `type`: Designated as `"sdfx"`, this key identifies the app as an SDFX application while maintaining compatibility with ComfyUI. This means SDFX apps can be dragged and dropped onto ComfyUI and vice versa.

### UI Mapping Structure

- `mapping`: Specifies the UI structure. Within the mapping, you might find the following structure to describe a Tab component with a checkpoint loader, fully compatible with Tailwind CSS classes:

```markdown
{
  "label": "Generation",
  "component": "Tab",
  "class": "p-4 lg:p-8 xl:p-10 overflow-y-scroll",
  "childrin": [
    {
      "component": "div",
      "class": "flex justify-between space-x-4 lg:space-x-8",
      "childrin": [
        {
          "label": "Section 1",
          "class": "leftview w-80",
          "component": "div",
          "childrin": [
            {
              "label": "Checkpoint",
              "showLabel": true,
              "type": "control",
              "component": "ModelPicker",
              "target": {
                "nodeId": 4,
                "nodeType": "CheckpointLoaderSimple",
                "widgetNames": ["ckpt_name"],
                "widgetIdxs": [0]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### LiteGraph Keys

- The remaining keys are standard LiteGraph properties used to describe the workflow.

### UI Components for Mapping

Developers can leverage a rich set of UI components for creating user interfaces. Here's a list of available components that can be used and customized with VueJS and Tailwind CSS:

- `Button`
- `DragNumber`
- `ImageLoader`
- `Input`
- `ModelPicker`
- `Number`
- `Preview`
- `Prompt`
- `PromptTimeline`
- `Selector`
- `Slider`
- `TextArea`
- `Toggle`
- `BoxDimensions`
- `BoxSeed`

Additionally, HTML elements such as `div`, `p`, `ul`, `li`, `img`, `iframe`, `video`, and more can be used to enrich the user interface.

For layout and structural design, elements like `SplitPane`, `SplitH`, `SplitV`, `Tab`, `TabBox`, `TabBar`, and `ToggleSettings` offer further customization.

The ease of creating new components with VueJS and Tailwind CSS is unmatched, allowing for rapid development and high-quality user interface design. As SDFX moves towards an open-source release, this guide will be invaluable for developers anticipating to engage with a professional and user-centric platform.

Enjoy creating with SDFX, and let the simplicity and power of JSON structure enhance your application development process.

### Upcoming Feature: SDFX App Creator

> **Note:** Currently, the process of designing your SDFX application and mapping UI components to node parameters is manual. We understand the intricacies involved and are excited to announce that the release of the SDFX App Creator is on the horizon.

The SDFX App Creator will let you create your UI mapping by introducing a visual design interface with drag & drop capabilities. This  will greatly simplify the process of linking UI controls with the corresponding node parameters in the workflow graph. Stay tuned for this feature.

## Installation
Make sure your system meets the following requirements:
* Node.js version 18.9.1
* npm version 8.19.1
* Python 3.11
* Git

### Windows 
```bash
  git clone https://github.com/sdfxai/sdfx.git
  cd sdfx
```
Then open ```setup.bat``` to install dependencies

<details>
<summary>Error says no Python, but it's installed?</summary>
A common mistake is forgetting to check the option to add Python to the PATH during installation, as it's often unchecked by default in the installer wizard. Make sure Python is added to your system's environment variables to run the script smoothly.

![SDFX Screenshot](/docs/static/install-python-env.png)
</details>


### Linux/MacOs

```bash
  git clone https://github.com/sdfxai/sdfx.git
  cd sdfx
  ./setup.sh
```

### Manual Install

<details>
<summary>Click to expand</summary>

To perform a manual installation, follow these steps:

1. **Install Frontend Dependencies:**

    Navigate to the `src` directory of SDFX and install the npm dependencies:
    ```bash
    cd src
    npm install
    cd ..
    ```

2. **Clone and Install ComfyUI:**

    Clone the ComfyUI repository into the root directory of SDFX [from ComfyUI GitHub and follow the installation instructions provided in the readme](https://github.com/comfyanonymous/ComfyUI?tab=readme-ov-file#installing) to install ComfyUI dependencies.

3. **Add the custom node SDFXBridgeForComfyUI**

    Follow the [instructions on the repository](https://github.com/sdfxai/SDFXBridgeForComfyUI/tree/master?tab=readme-ov-file#installation) of the custom node SDFXBridgeForComfyUI to add it to your ComfyUi custom_nodes folder.

4. **Create Configuration File:**

    Create a file named `sdfx.config.json` at the root of your project.
    Follow the instructions [provided here](https://github.com/sdfxai/SDFXBridgeForComfyUI?tab=readme-ov-file#configuration) to build the configuration file according to your requirements.

5. **Run**

    Start ComfyUI
    Then start SDFX with:
    ```bash
      cd src
      npm run start
    ```

</details>

### Installation for users already using ComfyUI Locally

<details>
<summary>Click to expand</summary>

If you already have ComfyUI installed on your machine, follow these steps to integrate SDFX:

1. Clone the SDFXBridgeForComfyUI custom_node on your ComfyUI custom_node path:
    ```bash
    git clone https://github.com/sdfxai/SDFXBridgeForComfyUI.git
    ```
2. For detailed instructions, please refer to the [official SDFX for ComfyUI README](https://github.com/sdfxai/SDFXBridgeForComfyUI/blob/master/README.md).

3. Install front-end dependencies and run it:

```bash
  cd src 
  npm install
  npm run start
```
</details>

### Run

Launch SDFX app with ```run.bat``` (```./run.sh``` for Linux/MacOs)
