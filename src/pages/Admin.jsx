import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      navigate("/");
      return;
    }

    if (user.email !== "katariavsk@gmail.com") {
      alert("Access denied");
      navigate("/");
      return;
    }

    setLoading(false);
  }

  if (loading) return <div className="p-4">Checking admin access...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p>Welcome, Admin</p>
    </div>
  );
}