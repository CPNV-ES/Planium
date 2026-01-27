
export async function getFLights(url, params = {}) {
    const searchParams = new URLSearchParams(params);
    try {
        const response = await fetch(`${url}?${searchParams.toString()}`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        return result
    } catch (error) {
        console.error(error.message);
    }
}

export function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                };
                resolve(coords);
            },
            (error) => {
                reject(error);
            }
        );
    });
}
