import React from 'react';

const BreadcrumbNav = ({
  isMobile,
  selectedHouseName,
  pathNames,
  onBreadcrumbClick
}) => {
  if (isMobile) {
    // 모바일 브레드크럼
    return (
      <div className="breadcrumb">
        <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(-1)}>
          {selectedHouseName}
        </span>
        {pathNames.length > 3 ? (
          // 3개 넘으면 축약
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(0)}>
              {pathNames[0]}
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item">...</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(pathNames.length - 2)}>
              {pathNames[pathNames.length - 2]}
            </span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current" onClick={() => onBreadcrumbClick(pathNames.length - 1)}>
              {pathNames[pathNames.length - 1]}
            </span>
          </>
        ) : (
          pathNames.map((name, index) => (
            <React.Fragment key={index}>
              <span className="breadcrumb-separator">›</span>
              <span
                className={index === pathNames.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}
                onClick={() => onBreadcrumbClick(index)}
              >
                {name}
              </span>
            </React.Fragment>
          ))
        )}
      </div>
    );
  }

  // PC 브레드크럼
  return (
    <div className="breadcrumb-row">
      <div className="breadcrumb">
        <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(-1)}>
          {selectedHouseName}
        </span>
        {pathNames.map((name, index) => (
          <React.Fragment key={index}>
            <span className="breadcrumb-separator">›</span>
            <span
              className={index === pathNames.length - 1 ? 'breadcrumb-current' : 'breadcrumb-item'}
              onClick={() => onBreadcrumbClick(index)}
            >
              {name}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BreadcrumbNav;
