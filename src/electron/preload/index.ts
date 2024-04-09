import { contextBridge, ipcRenderer } from 'electron'
import { isLinux, isMac, isWindows } from './utils/index'

contextBridge.exposeInMainWorld('electron', {
  isLinux,
  isWindows,
  isMac,
  isWeb: false,

  loadJSONFromDrive: (filename) => {
    ipcRenderer.send('loadJSON', filename)
    return new Promise(resolve => {
      ipcRenderer.on('loadedJSON', (event, ...args) => {
        // @ts-ignore
        resolve(...args)
      })
    })
  },

  saveJSONToDrive: (filename, txt) => {
    ipcRenderer.send('saveJSON', filename, txt)
    return new Promise(resolve => {
      ipcRenderer.on('savedJSON', (event, ...args) => {
        // @ts-ignore
        resolve(...args)
      })
    })
  },

  setAlwaysOnTop: (flag) => {
    ipcRenderer.send('setAlwaysOnTop')
  },

  setFullScreen: (flag) => {
    ipcRenderer.send('setFullScreen')
  },

  setAspectRatio: (ar) => {
    ipcRenderer.send('setAspectRatio')
  },

  minimize: () => {
    ipcRenderer.send('minimize')
  },

  maximize: () => {
    ipcRenderer.send('maximize')
  }
})

function domReady(condition: DocumentReadyState[] = ["complete", "interactive"]) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) scale(0.75) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) scale(2.2) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 1600ms 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #181c24;
  z-index: 50;
}
.glSDFX {
  font-weight: bold;
  color: #181c24;
  font-size: 1rem;
  padding: 0.2rem;
  line-height: 0.8rem;
}

    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap duration-300';
  oDiv.innerHTML = `
    <div class="${className} duration-300">
      <div class="glSDFX">SDFX</div>
    </div>
  `;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);
