

/**
 * A material that an item can be made of
 */
export interface Material {
    /**
     * id of the material
     */
    id: string;
    /**
     * name of the material
     */
    name: string;
    /**
     * Description of the material
     */
    description: string;
    /**
     * Type of the material
     */
    type: string;
    /**
     * Properties of the material
     */
    properties: {
        /**
         * Hardness of the material
         */
        hardness: number;
        /**
         * Weight of the material
         */
        weight: number;
        /**
         * Value of the material
         */
        value: number;
    }
}

