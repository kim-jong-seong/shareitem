import React from 'react';

/************************************************************
 * DESCRIPTION: BreadcrumbNav 컴포넌트
 *              현재 위치를 표시하는 브레드크럼 네비게이션
 *              PC와 모바일에서 다른 형태로 표시됨
 *
 * PROPS:
 * - isMobile: 모바일 여부
 * - selectedHouseName: 선택된 집 이름
 * - pathNames: 경로 이름 배열 (예: ['거실', '서랍'])
 * - onBreadcrumbClick: 브레드크럼 클릭 시 호출되는 함수
 ************************************************************/
const BreadcrumbNav = ({
    isMobile,
    selectedHouseName,
    pathNames,
    onBreadcrumbClick
}) => {
    /************************************************************
     * DESCRIPTION: 모바일 브레드크럼 렌더링
     *              경로가 3개를 넘으면 축약해서 표시
     *              (예: 집 › 거실 › ... › 서랍 › 물건)
     ************************************************************/
    if (isMobile) {
        return (
            <div className="breadcrumb">
                {/* 집 이름 (루트) */}
                <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(-1)}>
                    {selectedHouseName}
                </span>

                {pathNames.length > 3 ? (
                    /* 경로가 3개를 넘으면 축약 표시 */
                    <>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(0)}>
                            {pathNames[0]} {/* 첫 번째 */}
                        </span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item">...</span> {/* 생략 표시 */}
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(pathNames.length - 2)}>
                            {pathNames[pathNames.length - 2]} {/* 끝에서 두 번째 */}
                        </span>
                        <span className="breadcrumb-separator">›</span>
                        <span className="breadcrumb-current" onClick={() => onBreadcrumbClick(pathNames.length - 1)}>
                            {pathNames[pathNames.length - 1]} {/* 현재 위치 */}
                        </span>
                    </>
                ) : (
                    /* 경로가 3개 이하면 전체 표시 */
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

    /************************************************************
     * DESCRIPTION: PC 브레드크럼 렌더링
     *              전체 경로를 모두 표시
     ************************************************************/
    return (
        <div className="breadcrumb-row">
            <div className="breadcrumb">
                {/* 집 이름 (루트) */}
                <span className="breadcrumb-item" onClick={() => onBreadcrumbClick(-1)}>
                    {selectedHouseName}
                </span>

                {/* 전체 경로 표시 */}
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
