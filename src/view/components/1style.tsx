// import "../App.css";
// import {BackToHome} from './common/BackToHome.css';

function StyleDemo() {
  const name = "Hello Word";
  const ID = "id111";

  const divStyle: React.CSSProperties = {
    color: "red",
    fontSize: "30px",
    fontWeight: "bold",
    textAlign: "center",
  };

  return (
    <div>
      {/* <BackToHome /> */}
      <div>
        <h2>样式写法 示例</h2>

        {/* 样式写法1 */}
        <span style={{ color: "red", fontSize: "55px" }}>{name}</span>
        {/* 样式写法2 */}
        <span style={divStyle}>{name}</span>
        {/* 样式写法3 className1引入css*/}
        <div className="logo " id={ID}>
          <span style={{ color: "red", fontSize: "55px" }}>{name}</span>
        </div>
      </div>
    </div>
  );
}

export default StyleDemo;
