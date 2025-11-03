import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import PptxGenJS from "pptxgenjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PPTPreview({ slides, onClose }) {
  const [active, setActive] = useState(0);

 
  const handleDownloadPPT = () => {
    const pptx = new PptxGenJS();
    slides.forEach((s) => {
      const slide = pptx.addSlide();
      slide.addText(s.title || "Slide", {
        x: 0.5,
        y: 0.7,
        w: 9,
        fontSize: 28,
        bold: true,
        color: "003366",
      });
      slide.addText(s.content, {
        x: 0.8,
        y: 2.3,
        w: 9,
        fontSize: 20,
        color: "333333",
        lineSpacing: 40,
      });
    });
    pptx.writeFile({ fileName: "Generated_Presentation.pptx" });
  };


  const handleDownloadPDF = async () => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });

    for (let i = 0; i < slides.length; i++) {
      const el = document.getElementById(`slide-${i}`);
      if (!el) continue;

      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      if (i < slides.length - 1) pdf.addPage();
    }

    pdf.save("Generated_Presentation.pdf");
  };

  return (
    <div className="w-full">
    
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          Total Slides: {slides.length}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPPT}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Download PPT
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>

     
      <div className="flex flex-col items-center gap-6 overflow-y-auto max-h-[70vh] px-2">
        {slides.map((slide, i) => (
          <div
            key={i}
            id={`slide-${i}`}
            onClick={() => setActive(i)}
            className={`transition-transform duration-300 cursor-pointer ${
              i === active
                ? "scale-105 border-blue-500 shadow-2xl"
                : "scale-95 opacity-80"
            } w-[90%] bg-white border border-gray-300 rounded-lg p-6 flex flex-col justify-center items-center text-center`}
            style={{
              height: i === active ? "420px" : "360px",
            }}
          >
            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              {slide.title}
            </h2>
            <div
              className="text-gray-700 text-[14px] leading-relaxed"
              style={{ fontSize: "14px" }}
            >
              <ReactMarkdown>{slide.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
