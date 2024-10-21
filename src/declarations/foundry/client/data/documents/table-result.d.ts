declare interface TableResult {
    /**
     * Get the value of a "flag" for this document
     * See the setFlag method for more details on flags
     * @param scope The flag scope which namespaces the key
     * @param key The flag key
     */
    getFlag<T extends any>(scope: string, key: string): T;
}
