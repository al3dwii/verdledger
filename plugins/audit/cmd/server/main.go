package main

import (
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "time"

    "github.com/gorilla/mux"
    "github.com/verdledger/verdledger/plugins/audit/generator"
)

func main() {
    r := mux.NewRouter()
    r.HandleFunc("/v1/audit", scheduleAudit).Methods("POST")
    r.HandleFunc("/v1/audit/{id}", getStatus).Methods("GET")
    r.HandleFunc("/v1/audit/{id}/download/{type}", downloadFile).Methods("GET")
    log.Println(http.ListenAndServe(":8080", r))
}

type reqBody struct{
    OrgID int64 `json:"org_id"`
    Start string `json:"start"`
    End   string `json:"end"`
}

func scheduleAudit(w http.ResponseWriter, r *http.Request){
    var b reqBody
    _ = json.NewDecoder(r.Body).Decode(&b)
    start,_ := time.Parse("2006-01-02", b.Start)
    end,_ := time.Parse("2006-01-02", b.End)
    _ = start; _ = end
    // placeholder logic
    w.WriteHeader(202)
    _ = json.NewEncoder(w).Encode(map[string]any{"id":1})
}

func getStatus(w http.ResponseWriter,r *http.Request){
    _ = json.NewEncoder(w).Encode(map[string]string{"status":"done"})
}

func downloadFile(w http.ResponseWriter,r *http.Request){
    vars := mux.Vars(r)
    id,_ := strconv.ParseInt(vars["id"],10,64)
    _ = id
    typ := vars["type"]
    if typ == "pdf" {
        w.Header().Set("Content-Type","application/pdf")
    } else { w.Header().Set("Content-Type","application/xml") }
    w.Write([]byte("placeholder"))
}
