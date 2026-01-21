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
        console.log(result);

        return result
    } catch (error) {
        console.error(error.message);
    }
}