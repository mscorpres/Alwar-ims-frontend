

const CheckmarkLoader = ({ size = 40 }) => {
  return (
    <div style={{width: "100%", height:"100%", display:"flex", justifyContent:"center", alignItems:"center" }}>
     <video src="/assets/check.mp4" autoPlay loop muted />
    </div>
  );
};

export default CheckmarkLoader;

