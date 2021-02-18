function toggleTo(id) {
    $(".nav-link").removeClass("active");
    $("#nav-"+id).addClass("active");
    $(".wiz-step").hide();
    $("#div-"+id).show();

    draw();
}

// initialize view
toggleTo("system");

function applyBestPractice(newTotal = false) {
    
    totalGB = $("#input-total").val();

    // When setting a new system overall total, reset the OS %.
    if (newTotal) {
        // This is somewhat arbitrary as globuf defaults are based on total memory,
        // but it's informative in the visual sense and a reminder IRIS is not alone.
        $("#input-os").val((totalGB > 64) ? 10 : 20);
    }

    // applying globuf best practices per
    // https://docs.intersystems.com/irislatest/csp/docbook/Doc.View.cls?KEY=GSCALE_vertical#GSCALE_vertical_memory_oview
    //      ==> 50% of total memory when < 64GB, 70% otherwise
    globufPct = (totalGB < 64) ? 50 : 70;

    // applying roubuf best practices per
    // http://turbo.iscinternal.com/prodlog/devview.csp?Key=RJF432 
    //      ==> 10% of global buffers, min 36MB, max 1020MB
    roubufMB = (globufPct / 100 * totalGB * 1024) / 10;
    if (roubufMB < 36) roubufMB = 36;
    if (roubufMB > 1020) roubufMB = 1020;

    // applying heap best practices per 
    // https://docs.intersystems.com/irislatest/csp/docbook/Doc.View.cls?KEY=GSCALE_vertical#GSCALE_vertical_memory_oview
    //      ==> 256MB when < 64GB, 384MB otherwise
    // increased per CM advice
    //      ==> 256MB when < 16GB, 384MB when < 32GB, 512MB when < 64GB, 1024MB otherwise
    heapMB = (totalGB < 16) ? 256 : (totalGB < 32) ? 384 : (totalGB < 64) ? 512 : 1024;

    // budgeting 1/8th of heap space for locks, max at 128
    lockMB = heapMB / 8;
    if (lockMB > 128) lockMB = 128;

    // apply settings and re-draw
    x = $("#input-globuf").val(globufPct);
    x = $("#input-roubuf").val(roubufMB);
    x = $("#input-heap").val(heapMB);
    x = $("#input-locks").val(lockMB);
    draw();
}

// initialize best practices
applyBestPractice(true);

function draw() {

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

    // heap
    heapMB = parseInt($("#input-heap").val());
    lockMB = parseInt($("#input-locks").val());

    drawBar("bar-heap-os", osMB, totalMB, "OS");
    drawBar("bar-heap-globuf", globufMB, totalMB, "Globals");
    drawBar("bar-heap-roubuf", roubufMB, totalMB, "Routines");
    drawBar("bar-heap-heap", (heapMB+lockMB), totalMB, "Heap", "(includes locks)");
    drawBar("bar-heap-iris", totalMB-osMB-globufMB-roubufMB-heapMB-lockMB, totalMB, "IRIS processes");
    

    // generate script
    globals = "0,0,"+globufMB+",0,0,0";
    routines = roubufMB;
    gmheap = (heapMB+lockMB)*1024; // in kb
    locksiz = lockMB*1024*1024; // in bytes
    bbsiz = $("#input-ppm").val()*1024; // in kb

    $("#script-cpf").text("[config]\n" +
                          "globals="+globals+"\n" +
                          "routines="+routines+"\n" +
                          "gmheap="+gmheap+"\n" +
                          "locksiz="+locksiz+"\n" +
                          "bbsiz="+bbsiz);

    $("#script-cos").text('zn "%SYS"\n' +
                          'set props = ##class(Config.config).Open()\n' +
                          'set props.globals8kb = '+globufMB+"\n" +
                          'set props.routines = '+routines+"\n" +
                          'set props.gmheap = '+gmheap+"\n" +
                          'set props.locksiz = '+locksiz+"\n" +
                          'set props.bbsiz = '+bbsiz+"\n" +
                          'set status = props.%Save()\n' + 
                          'do:\'status $SYSTEM.OBJ.DisplayError(status)');

}

function drawBar(id, mb, total, str, info="") {
    $("#"+id).css("width", formatWidth(mb/total))
             .text(str+": "+formatMB(mb))
             .attr("data-content", str+": "+formatMB(mb)+" "+info)
             .popover({
                "placement": "bottom",
                "trigger": "hover"
             });
}

function formatMB(mb) {
    if (mb > 1025) {
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
