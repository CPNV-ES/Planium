import { ref } from "vue";
export function useMapController() {
    const viewerRef = ref()
    const isViewerReady = ref(false)

    const onViewerReady = (readyObj) => {
        isViewerReady.value = true

        readyObj.viewer.camera.flyTo({
            destination: readyObj.Cesium.Cartesian3.fromDegrees(6.500465335539498, 46.82166054184684, 10000)
        })
    }

    return {
        isViewerReady,
        viewerRef,
        onViewerReady
    }
}
