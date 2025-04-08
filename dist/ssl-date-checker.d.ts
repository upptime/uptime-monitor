export declare function checker(host: string, port: number): Promise<{
    valid_from: string;
    valid_to: string;
    serialNumber: string;
    fingerprint: string;
}>;
