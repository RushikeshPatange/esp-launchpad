import { ESPLoader } from "../esploader";
import { ROM } from "./rom";
export declare class ESP32S2ROM extends ROM {
    CHIP_NAME: string;
    IMAGE_CHIP_ID: number;
    MAC_EFUSE_REG: number;
    EFUSE_BASE: number;
    UART_CLKDIV_REG: number;
    UART_CLKDIV_MASK: number;
    UART_DATE_REG_ADDR: number;
    FLASH_WRITE_SIZE: number;
    BOOTLOADER_FLASH_OFFSET: number;
    FLASH_SIZES: {
        "1MB": number;
        "2MB": number;
        "4MB": number;
        "8MB": number;
        "16MB": number;
    };
    SPI_REG_BASE: number;
    SPI_USR_OFFS: number;
    SPI_USR1_OFFS: number;
    SPI_USR2_OFFS: number;
    SPI_W0_OFFS: number;
    SPI_MOSI_DLEN_OFFS: number;
    SPI_MISO_DLEN_OFFS: number;
    TEXT_START: number;
    ENTRY: number;
    DATA_START: number;
    ROM_DATA: string;
    ROM_TEXT: string;
    get_pkg_version(loader: ESPLoader): Promise<number>;
    get_chip_description(loader: ESPLoader): Promise<string>;
    get_chip_features(loader: ESPLoader): Promise<string[]>;
    get_crystal_freq(loader: ESPLoader): Promise<number>;
    _d2h(d: number): string;
    read_mac(loader: ESPLoader): Promise<string>;
    get_erase_size(offset: number, size: number): number;
}
