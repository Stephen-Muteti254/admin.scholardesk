import { RequestsPage } from "@/components/admin/RequestsPage";

function AssignmentHelp(){
  return(
    <>
      <RequestsPage
        title="Assignment Help"
        description="Single-task requests with deadlines, revision cycles and per-job pricing."
        types={["assignment"]}
      />
    </>
  );
}

export default AssignmentHelp;
