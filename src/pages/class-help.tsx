import { RequestsPage } from "@/components/admin/RequestsPage";

function ClassHelp(){
  return(
    <>
      <RequestsPage
        title="Class Help"
        description="Semester-long engagements — syllabus review, milestone quoting and expert allocation."
        types={["class"]}
      />      
    </>
  );
}

export default ClassHelp;
