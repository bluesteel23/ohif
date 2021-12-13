import csTools from 'cornerstone-tools';

/** Internal imports */
import TOOL_NAMES from '../constants/toolNames';
import getRenderableData from './getRenderableData';

const globalImageIdSpecificToolStateManager =
  csTools.globalImageIdSpecificToolStateManager;

/**
 * Add a measurement to a display set.
 *
 * @param {*} measurement
 * @param {*} imageId
 * @param {*} displaySetInstanceUID
 */
export default function addMeasurement(
  measurement,
  imageId,
  displaySetInstanceUID
) {
  // TODO -> Render rotated ellipse .

  const toolName = TOOL_NAMES.DICOM_SR_DISPLAY_TOOL;

  const measurementData = {
    TrackingUniqueIdentifier: measurement.TrackingUniqueIdentifier,
    renderableData: {},
    labels: measurement.labels,
  };

  measurement.coords.forEach(coord => {
    const { GraphicType, GraphicData, ValueType } = coord;

    if (measurementData.renderableData[GraphicType] === undefined) {
      measurementData.renderableData[GraphicType] = [];
    }

    measurementData.renderableData[GraphicType].push(
      getRenderableData(GraphicType, GraphicData, ValueType)
    );
  });

  const toolState = globalImageIdSpecificToolStateManager.saveToolState();

  if (toolState[imageId] === undefined) {
    toolState[imageId] = {};
  }

  const imageIdToolState = toolState[imageId];

  // If we don't have tool state for this type of tool, add an empty object
  if (imageIdToolState[toolName] === undefined) {
    imageIdToolState[toolName] = {
      data: [],
    };
  }

  const toolData = imageIdToolState[toolName];

  toolData.data.push(measurementData);

  measurement.loaded = true;
  measurement.imageId = imageId;
  measurement.displaySetInstanceUID = displaySetInstanceUID;

  // Remove the unneeded coord now its processed, but keep the SOPInstanceUID.
  // NOTE: We assume that each SCOORD in the MeasurementGroup maps onto one frame,
  // It'd be super werid if it didn't anyway as a SCOORD.
  measurement.ReferencedSOPInstanceUID =
    measurement.coords[0].ReferencedSOPSequence.ReferencedSOPInstanceUID;

  return measurement;
}