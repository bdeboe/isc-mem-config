function toggleTo(id) {
    $(".nav-link").removeClass("active");
    $("#nav-"+id).addClass("active");
    $(".wiz-step").hide();
    $("#div-"+id).show();

    calcAll((id=="system") ? 0 : (id=="os") ? 1 : (id=="buffer") ? 2 : 3);
}

toggleTo("system");

function calcAll(step=0) {

    // total
    totalMB = $("#input-total").val()*1024;
    $("#bar-system-total").text("Total: "+formatMB(totalMB));

    // reserve for OS
    osPct = $("#input-os").val();
    $("#input-os-t").text("% of "+formatMB(totalMB));
    osMB = parseInt(totalMB * osPct / 100);
    irisMB = totalMB - osMB;
    $("#input-os-b").text("= "+formatMB(osMB));

    drawBar("bar-os-os", osMB, totalMB, "OS");
    drawBar("bar-os-iris", irisMB, totalMB, "IRIS");
    
    // buffers
    globufPct = $("#input-globuf").val();
    $("#input-globuf-t").text("% of "+formatMB(totalMB));
    globufMB = parseInt(totalMB * globufPct / 100);
    $("#input-globuf-b").text("= "+formatMB(globufMB));
    roubufMB = parseInt($("#input-roubuf").val());

    drawBar("bar-globuf-os", osMB, totalMB, "OS");
    drawBar("bar-globuf-globuf", globufMB, totalMB, "Globals");
    drawBar("bar-globuf-roubuf", roubufMB, totalMB, "Routines");
    drawBar("bar-globuf-iris", totalMB-osMB-globufMB-roubufMB, totalMB, "Other IRIS");

    // advanced
    heapMB = parseInt($("#input-heap").val());

    drawBar("bar-advanced-os", osMB, totalMB, "OS");
    drawBar("bar-advanced-globuf", globufMB, totalMB, "Globals");
    drawBar("bar-advanced-roubuf", roubufMB, totalMB, "Routines");
    drawBar("bar-advanced-heap", heapMB, totalMB, "Heap");
    drawBar("bar-advanced-iris", totalMB-osMB-globufMB-roubufMB-heapMB, totalMB, "Other IRIS");
    

    // generate script
    globals = "0,0,"+globufMB+",0,0,0";
    routines = roubufMB;
    gmheap = heapMB;
    locksiz = $("#input-locks").val()*1024*1024;
    bbsiz = $("#input-ppm").val()*1024;

    $("#script-cpf").text("[config]\n" +
                          "globals="+globals+"\n" +
                          "routines="+routines+"\n" +
                          "gmheap="+gmheap+"\n" +
                          "locksiz="+locksiz+"\n" +
                          "bbsiz="+bbsiz);
}

function drawBar(id, mb, total, str) {
    $("#"+id).css("width", formatWidth(mb/total))
             .text(str+": "+formatMB(mb))
             .popover({
                //"title": str,
                "content": str+": "+formatMB(mb),
                "placement": "bottom",
                "trigger": "hover"
             }) //.popover("show")
             ;
}

function formatMB(mb) {
    if (mb > 1000) {
        return (Math.round(mb/102.4)/10)+" GB";
    } else {
        return mb + " MB";
    }
}
function formatWidth(pct) {
    if (pct <= 0.01) {
        return "20px";
    } else {
        return Math.round(pct*100)+"%";
    }
}
