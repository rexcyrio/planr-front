import React from "react";
import { useSelector } from "react-redux";
import { selectModuleCodes } from "../../store/storeHelpers/selectors";
import ModuleColourSelect from "./ModuleColourSelect";

function MappingModuleCodeToColourName() {
  const moduleCodes = useSelector((state) => selectModuleCodes(state));
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.mappingModuleCodeToColourName
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <div>
          {getHalfOfArray(moduleCodes, 0).map((moduleCode, index) => (
            <React.Fragment key={moduleCode}>
              {index !== 0 && <br />}
              <ModuleColourSelect
                moduleCode={moduleCode}
                colourName={mappingModuleCodeToColourName[moduleCode]}
              />
            </React.Fragment>
          ))}
        </div>
        <div>
          {getHalfOfArray(moduleCodes, 1).map((moduleCode, index) => (
            <React.Fragment key={moduleCode}>
              {index !== 0 && <br />}
              <ModuleColourSelect
                moduleCode={moduleCode}
                colourName={mappingModuleCodeToColourName[moduleCode]}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

function getHalfOfArray(array, segment) {
  if (segment === 0) {
    return array.slice(0, Math.ceil(array.length / 2));
  } else if (segment === 1) {
    return array.slice(Math.ceil(array.length / 2));
  }
}

export default MappingModuleCodeToColourName;
