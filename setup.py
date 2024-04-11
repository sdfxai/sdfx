import os
import subprocess
import sys
import json
import shutil
from urllib.request import urlretrieve

PYTHON_VERSION = "3.10"

def install_dependencies(gpu_type):
    original_dir = os.getcwd()

    # Clone ComfyUI if it doesn't exist
    comfyui_path = os.path.join(original_dir, "ComfyUI")
    if not os.path.exists(comfyui_path):
        comfyui_repo_url = "https://github.com/comfyanonymous/ComfyUI.git"
        subprocess.run(["git", "clone", comfyui_repo_url])

    # Clone SDFX custom_node if it doesn't exist
    sdfx_path = os.path.join(original_dir, "ComfyUI", "custom_nodes", "SDFXBridgeForComfyUI")
    if not os.path.exists(sdfx_path):
        os.chdir("ComfyUI/custom_nodes")
        sdfx_project_url = "https://github.com/sdfxai/SDFXBridgeForComfyUI"
        subprocess.run(["git", "clone", sdfx_project_url])

    os.chdir(original_dir)

    # Copy the example config file if it doesn't exist
    sdfx_config_example_path = os.path.join("ComfyUI", "custom_nodes", "SDFXBridgeForComfyUI", "sdfx.config.json.example")
    if not os.path.exists("sdfx.config.json"):
        shutil.copy(sdfx_config_example_path, "sdfx.config.json")

    # Copy the .env file if it doesn't exist
    env_example_path = os.path.join("src", ".env.example")
    env_path = os.path.join("src", ".env")
    if not os.path.exists(env_path):
        shutil.copy(env_example_path, env_path)

    # Install GPU dependencies
    if not gpu_type:
        gpu_type = input("Choose your GPU type:\n1. NVIDIA\n2. AMD\n3. DIRECTML (AMD on Windows)\n4. CPU\n5. Apple Mac Silicon\nEnter the GPU type (1 for NVIDIA, 2 for AMD, 3 for DIRECTML, 4 for CPU, 5 for Apple Mac Silicon): ")
    
    if gpu_type == "1":
        # NVIDIA - Install PyTorch for NVIDIA
        subprocess.run([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio", "--extra-index-url", "https://download.pytorch.org/whl/cu121"])
        print("Installation completed for NVIDIA GPU.")
    elif gpu_type == "2":
        # AMD - Install stable version
        subprocess.run([sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio", "--index-url", "https://download.pytorch.org/whl/rocm5.6"])
        print("Installation completed for AMD.")
    elif gpu_type == "3":
        # DIRECTML
        subprocess.run([sys.executable, "-m", "pip", "install", "torch-directml"])
        with open("sdfx.config.json", "r") as json_file:
            data = json.load(json_file)
            data["args"]["directml"] = True
            with open("sdfx.config.json", "w") as outfile:
                json.dump(data, outfile, indent=2)
        print("Installation completed for DirectML GPU.")
    elif gpu_type == "4":
        # CPU
        with open("sdfx.config.json", "r") as json_file:
            data = json.load(json_file)
            data["args"]["cpu"] = True
            with open("sdfx.config.json", "w") as outfile:
                json.dump(data, outfile, indent=2)
        print("Installation completed for CPU.")
    elif gpu_type == "5":
        # Apple Mac Silicon
        print("Installation completed for Apple Mac Silicon.")
    else:
        print("Invalid GPU type. Please enter 1 for NVIDIA, 2 for AMD, 3 for DIRECTML, 4 for CPU")
        sys.exit(1)

    # Install Python dependencies
    requirements_path_comfyui = os.path.join("ComfyUI", "requirements.txt")
    requirements_path_sdfx = os.path.join("ComfyUI", "custom_nodes", "SDFXBridgeForComfyUI", "requirements.txt")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", requirements_path_comfyui])
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", requirements_path_sdfx])
    
    # High-quality previews
    url = 'https://github.com/madebyollin/taesd/raw/main/taesd_decoder.pth'
    destination_path = 'data/models/vae_approx/taesd_decoder.pth'
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    try:
        urlretrieve(url, destination_path)
    except Exception as e:
        print(f'Error downloading taesd_decoder.pth: {e}')
        exit()

    # SDFX front dependencies
    subprocess.run(f"cd src && npm install", shell=True)
    
    print("\nFinished! Run ./run.sh to launch SDFX")

def update_dependencies():
    # Update SDFX custom_node
    os.chdir("ComfyUI")
    subprocess.run(["git", "pull"])
    os.chdir("custom_nodes")
    subprocess.run(["git", "pull"])
    subprocess.run([sys.executable, sys.argv[0], "--install"])

def run():
    # Run ComfyUI
    comfyui_process = subprocess.Popen([sys.executable, 'main.py'], shell=True, cwd='ComfyUI', text=True)
    comfyui_pid = comfyui_process.pid

    # Run app
    npm_process = subprocess.Popen('npm run start', shell=True, cwd='src', text=True)
    npm_pid = npm_process.pid
    comfyui_process.wait()
    npm_process.wait()

def main():
    print("███████╗██████╗ ███████╗██╗  ██╗")
    print("██╔════╝██╔══██╗██╔════╝╚██╗██╔╝")
    print("███████╗██║  ██║█████╗   ╚███╔╝ ")
    print("╚════██║██║  ██║██╔══╝   ██╔██╗ ")
    print("███████║██████╔╝██║     ██╔╝ ██╗")
    print("╚══════╝╚═════╝ ╚═╝     ╚═╝  ╚═╝")
                                
    option = None
    gpu_type = None
    
    for arg in sys.argv[1:]:
        if arg == "--install":
            option = "1"
        elif arg == "--update":
            option = "2"
        elif arg == "--run":
            option = "3"
        elif arg == "--nvidia":
            gpu_type = "1"
        elif arg == "--amd":
            gpu_type = "2"
        elif arg == "--directml":
            gpu_type = "3"
        elif arg == "--cpu":
            gpu_type = "4"
        elif arg == "--mac":
            gpu_type = "5"
        else:
            print(f"Invalid option: {arg}")
            sys.exit(1)

    if not option:
        # If options are not provided, ask interactively
        print("Please choose an option:")
        print("1. Install")
        print("2. Update")
        print("3. Run")
        
        option = input("Enter the option number (1, 2 or 3): ")

    if option == "1":
        # Check Python version
        current_python_version = subprocess.run([sys.executable, "--version"], capture_output=True, text=True).stdout.split()[1]
        if current_python_version < PYTHON_VERSION:
            print(f"Error: Python version {PYTHON_VERSION} or later is required.")
            sys.exit(1)

        install_dependencies(gpu_type)
    elif option == "2":
        update_dependencies()
    elif option == "3":
        run()
    else:
        print("Invalid option. Please use --install or --update")
        sys.exit(1)

if __name__ == "__main__":
    print("Loading...")
    # Check if git and node are available
    required_commands = ['git', 'node']

    if not all(shutil.which(cmd) for cmd in required_commands):
        print("Error: Git and Node.js are required. Please install them before proceeding.")
        sys.exit(1)

    venv_path = os.environ.get("VIRTUAL_ENV")
    if not venv_path:
        # Creating virtual environment
        subprocess.run([sys.executable, "-m", "venv", ".venv"])
        # Launch a new Python process with the specified virtual environment activated

        if sys.platform == "win32":
            os.system(r'cmd /c ".venv\Scripts\activate && ' + sys.executable + ' setup.py '+' '.join(sys.argv[1:])+'"')
        else:
            subprocess.run(f"source .venv/bin/activate && {sys.executable} setup.py "+' '.join(sys.argv[1:]), shell=True)

    else:
        main()
