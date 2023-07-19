const connectButton = document.getElementById("connectButton");
const consoleStartButton = document.getElementById("consoleStartButton");
const terminal = document.getElementById("terminal");
const mainContainer = document.getElementById("mainContainer");
let resizeTimeout = false;

import * as esptooljs from "../node_modules/esptool-js/bundle.js";
const ESPLoader = esptooljs.ESPLoader;
const Transport = esptooljs.Transport;

const usbPortFilters = [
    { usbVendorId: 0x10c4, usbProductId: 0xea60 }, /* CP2102/CP2102N */
    { usbVendorId: 0x0403, usbProductId: 0x6010 }, /* FT2232H */
    { usbVendorId: 0x303a, usbProductId: 0x1001 }, /* Espressif USB_SERIAL_JTAG */
    { usbVendorId: 0x303a, usbProductId: 0x1002 }, /* Espressif esp-usb-bridge firmware */
    { usbVendorId: 0x303a, usbProductId: 0x0002 }, /* ESP32-S2 USB_CDC */
    { usbVendorId: 0x303a, usbProductId: 0x0009 }, /* ESP32-S3 USB_CDC */
];

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

let term = new Terminal({ cols: getTerminalColumns(), rows: 23, fontSize: 14 });
let fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(terminal);
fitAddon.fit();

let device = null;
let transport;
let chip = "default";
let chipDesc = "default";
let esploader;
let connected = false;
var config = [];
var isDefault = true;

// Code for minimlaESPLaunchpad
const consolePage = document.getElementById("console");
const spinner = document.getElementById("spinner");
const col1 = document.getElementById("col1");
const col2 = document.getElementById("col2");
let partsArray = undefined;
let addressesArray = undefined;

function build_DIY_UI() {
    let application = "supported_apps";
    let chipInConfToml = undefined;
    let imageString = undefined;
    let addressString = undefined;
    if (chip !== "default" && config["multipart"]) {
        chipInConfToml = config["chip"];
    }
    if (chip !== "default" && chipInConfToml !== undefined) {
        imageString = "image." + chipInConfToml.toLowerCase() + ".parts";
        addressString = "image." + chipInConfToml.toLowerCase() + ".addresses";
    }
    partsArray = config[config[application][0]][imageString];
    addressesArray = config[config[application][0]][addressString];
}

async function downloadAndFlash() {
    let fileArr = []
    for (let index = 0; index < partsArray.length; index++) {

        let data = await new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', partsArray[index], true);
            xhr.responseType = "blob";
            xhr.send();
            xhr.onload = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var blob = new Blob([xhr.response], { type: "application/octet-stream" });
                    var reader = new FileReader();
                    reader.onload = (function (theFile) {
                        return function (e) {
                            resolve(e.target.result);
                        };
                    })(blob);
                    reader.readAsBinaryString(blob);
                } else {
                    resolve(undefined);
                }
            };
            xhr.onerror = function () {
                resolve(undefined);
            }
        });
        fileArr.push({ data: data, address: addressesArray[index] });
    }
    $('#console').click();
    try {
        const flashOptions = {
            fileArray: fileArr,
            flashSize: "keep",
            flashMode: undefined,
            flashFreq: undefined,
            eraseAll: false,
            compress: true,
        };
        await esploader.write_flash(flashOptions);
        esploader.status = "complete"
    } catch (error) {
    }
}

function MDtoHtml() {
    let application = "supported_apps";
    const message = document.getElementById("messege");
    var converter = new showdown.Converter({ tables: true });
    converter.setFlavor('github');
    try {
        fetch(config[config[application][0]]["readme.text"]).then(response => {
            return response.text();
        }).then(result => {
            let htmlText = converter.makeHtml(result);
            message.innerHTML = htmlText;
            consoleStartButton.click()
            message.style.display = "block";
            col1.classList.remove("col");
            col1.classList.add("col-6");
            col1.classList.add("fadeInUp");
            col2.classList.remove("col-12");
            col2.classList.add("slide-right");
            col2.classList.add("col-6");
            resizeTerminal();

        })
    } catch (error) {
        message.style.display = "none";
    }
}
// Build the Quick Try UI using the config toml file. If external path is not specified, pick up the default config
async function buildQuickTryUI() {
    let tomlFileURL = undefined;
    const urlParams = new URLSearchParams(window.location.search);
    const url = window.location.search;
    const parameter = "flashConfigURL";
    if (url.includes("&")) {
        tomlFileURL = url.substring(url.search(parameter) + parameter.length + 1);
    } else {
        tomlFileURL = urlParams.get(parameter);
    }
    isDefault = false;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', tomlFileURL, true);
    xhr.send();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            config = toml.parse(xhr.responseText);
            return config;
        }
    }
}

config = await buildQuickTryUI();

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="tooltip"]').tooltip({
        trigger: "manual"
    });

    $('[data-toggle="tooltip"]').on('mouseleave', function () {
        $(this).tooltip('hide');
    });

    $('[data-toggle="tooltip"]').on('mouseenter', function () {
        $(this).tooltip('show');
    });

    $('[data-toggle="tooltip"]').on('click', function () {
        $(this).tooltip('hide');
    });
})

function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let espLoaderTerminal = {
    clean() {
        term.clear();
    },
    writeLine(data) {
        term.writeln(data);
    },
    write(data) {
        term.write(data)
    }
}

async function connectToDevice() {
    connectButton.style.display = "none";
    if (device === null) {
        device = await navigator.serial.requestPort({
            filters: usbPortFilters
        });
        transport = new Transport(device);
    }
    spinner.style.display = "flex";
    spinner.style.flexDirection = "column";
    spinner.style.alignItems = "center";

    try {
        const loaderOptions = {
            transport: transport,
            baudrate: 921600,
            terminal: espLoaderTerminal
        };
        esploader = new ESPLoader(loaderOptions);
        connected = true;

        chipDesc = await esploader.main_fn();
        chip = esploader.chip.CHIP_NAME;

        await esploader.flash_id();
    } catch (e) {
    }
    spinner.style.display = "none";
}

connectButton.onclick = async () => {
    try {
        if (!connected)
            await connectToDevice();
        consolePage.classList.remove("main-page-tab-panel");
        consolePage.classList.add("fade-in");
        col2.classList.remove("col");
        col2.classList.add("col-12");
        build_DIY_UI();
        await downloadAndFlash();
        consoleStartButton.disabled = false;
        MDtoHtml();
        setTimeout(() => {
            col1.classList.add("bounce");
        }, 2500)
    } catch (error) {
        if (error.message === "Failed to execute 'requestPort' on 'Serial': No port selected by the user.") {
            connectButton.style.display = "initial";
        }
    }

}

const restartDevice = async () => {
    await transport.setDTR(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    await transport.setDTR(true);
}

consoleStartButton.onclick = async () => {
    if (device === null) {
        device = await navigator.serial.requestPort({
            filters: usbPortFilters
        });
        transport = new Transport(device);
    }

    await restartDevice();
    await transport.disconnect();
    await transport.connect();

    while (true) {
        let val = await transport.rawRead();
        if (typeof val !== 'undefined') {
            term.write(val);
        } else {
            break;
        }
    }
}

function getTerminalColumns() {
    const mainContainerWidth = mainContainer?.offsetWidth || 1320;
    return Math.round(mainContainerWidth / 8.25);
}

function resizeTerminal() {
    fitAddon && fitAddon.fit();
}

$(window).resize(function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeTerminal, 300);
});