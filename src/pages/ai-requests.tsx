import { RequestsPage } from "@/components/admin/RequestsPage";

function AIRequests(){
  return(
    <>
      <RequestsPage
        title="AI & Plagiarism"
        description="Detection reports and AI/plagiarism removal jobs, with scan scores, quotes and delivery."
        types={["ai-report", "ai-removal"]}
      />
    </>
  );
}

export default AIRequests;
