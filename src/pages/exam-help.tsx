import { RequestsPage } from "@/components/admin/RequestsPage";

function ExamHelp(){
  return(
    <>
      <RequestsPage
        title="Exam & Interview Help"
        description="Expert-assisted sittings and ExamStealth self-serve bookings across every proctoring platform."
        types={["exam", "interview"]}
      />
    </>
  );
}

export default ExamHelp;
