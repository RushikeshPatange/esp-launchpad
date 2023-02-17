import { ESPLoader } from "../esploader";
export declare abstract class ROM {
    abstract get_chip_description(loader: ESPLoader): Promise<string>;
    abstract get_chip_features(loader: ESPLoader): Promise<string[]>;
    abstract get_crystal_freq(loader: ESPLoader): Promise<number>;
    abstract _d2h(d: number): string;
    abstract read_mac(loader: ESPLoader): Promise<string>;
    _post_connect?(loader: ESPLoader): Promise<void>;
    get_erase_size(offset: number, size: number): number;
    abstract FLASH_SIZES: {
        [key: string]: number;
    };
    abstract BOOTLOADER_FLASH_OFFSET: number;
    abstract CHIP_NAME: string;
    abstract DATA_START: number;
    abstract ENTRY: number;
    abstract FLASH_WRITE_SIZE: number;
    abstract ROM_DATA: string;
    abstract ROM_TEXT: string;
    abstract SPI_MOSI_DLEN_OFFS: number;
    abstract SPI_MISO_DLEN_OFFS: number;
    abstract SPI_REG_BASE: number;
    abstract SPI_USR_OFFS: number;
    abstract SPI_USR1_OFFS: number;
    abstract SPI_USR2_OFFS: number;
    abstract SPI_W0_OFFS: number;
    abstract UART_CLKDIV_MASK: number;
    abstract UART_CLKDIV_REG: number;
    abstract UART_DATE_REG_ADDR: number;
    abstract TEXT_START: number;
}
