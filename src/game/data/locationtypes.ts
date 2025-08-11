export const LOCATION_TYPE_BUILDING: number = 1;
export const LOCATION_TYPE_FIELD: number = 2;
export const LOCATION_TYPE_EXIT: number = 3;
export const LOCATION_TYPE_ROAD: number = 4;

export interface LocationType {
    name: string;
    description: string;
    color: string;
}

export const LOCATION_NAME_MAP: Record<number, LocationType> = {
    [LOCATION_TYPE_BUILDING]: {
        name: "Building",
        description: "A building is a structure that is used for a specific purpose.",
        color: "#4CAF50",
    },
    [LOCATION_TYPE_FIELD]: {
        name: "Field",
        description: "A field is an open area of land.",
        color: "#2196F3",
    },
    [LOCATION_TYPE_EXIT]: {
        name: "Exit",
        description: "An exit is a way to leave a location.",
        color: "#f44336",
    },
    [LOCATION_TYPE_ROAD]: {
        name: "Road",
        description: "A road is a path between two locations.",
        color: "#ffd700",
    }
}