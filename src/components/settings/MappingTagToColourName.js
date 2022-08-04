import React from "react";
import { useSelector } from "react-redux";
import { selectTags } from "../../store/storeHelpers/selectors";
import TagColourSelect from "./TagColourSelect";

function MappingTagToColourName() {
  const tags = useSelector((state) => selectTags(state));
  const mappingTagToColourName = useSelector(
    (state) => state.mappingTagToColourName
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
          {getHalfOfArray(tags, 0).map((tag, index) => (
            <React.Fragment key={tag}>
              {index !== 0 && <br />}
              <TagColourSelect
                tag={tag}
                colourName={mappingTagToColourName[tag]}
              />
            </React.Fragment>
          ))}
        </div>
        <div>
          {getHalfOfArray(tags, 1).map((tag, index) => (
            <React.Fragment key={tag}>
              {index !== 0 && <br />}
              <TagColourSelect
                tag={tag}
                colourName={mappingTagToColourName[tag]}
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

export default MappingTagToColourName;
