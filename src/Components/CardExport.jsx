import { Card } from "antd";

const CardExport = ({ children, title, extra }) => {
  return (
    <Card
      title={title.toUpperCase()}
      bordered={true}
      extra={extra}
      style={{
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        borderRadius: "0px",
      }}
      headStyle={{
        backgroundColor: "#f5f5f5",
        color: "#333",
        fontWeight: "bold",
        fontSize: "16px",
        minHeight: "40px",
      }}
      bodyStyle={{
        padding: "12px 16px",
      }}
    >
      {children}
    </Card>
  );
};

export default CardExport;