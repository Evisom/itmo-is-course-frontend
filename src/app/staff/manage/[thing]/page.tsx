const ManagePage = ({ params }) => {
  const { thing } = params;
  const allowedParams = ["authors", "genres", "themes", "publishers"];

  if (!allowedParams.includes(thing)) {
  }
  return <>{thing}</>;
};

export default ManagePage;
