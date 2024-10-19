import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md ">
        <CardBody className="text-center">
          <blockquote className="text-2xl font-semibold italic text-center text-slate-900 mt-2 ">
            <span className="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-teal-300 relative inline-block">
              <span className="relative text-white">Schedule Maker</span>
            </span>
          </blockquote>
          {/* Botón que redirige a Consulta 1 */}
          <Link to="/consult1">
            <Button variant="gradient" fullWidth className="mb-4 mt-6">
              Consulta 1
            </Button>
          </Link>
          {/* Botón que redirige a Consulta 2 */}
          <Link to="/consult2">
            <Button  variant="gradient" fullWidth>
              Consulta 2
            </Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
};

export default Home;
