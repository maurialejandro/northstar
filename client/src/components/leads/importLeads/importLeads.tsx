import React, { useState, useEffect } from "react";
import leadService from "../../../services/lead.service.tsx";
import { Button, Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import style from "./importLeads.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { Lead } from "../../../types/leadTypes.ts";
import * as XLSX from 'xlsx';

const ImportLeads = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [failedLeads, setFailedLeads] = useState<Partial<Lead>[]>([]);
    const [postedLeads, setPostedLeads] = useState(0);
    const [duplicatedLeads, setDuplicatedLeads] = useState<Partial<Lead>[]>([]);
    const [failedParsingLeads, setFailedParsingLeads] = useState<string[]>([]);
    const [XLSXData, setXLSXData] = useState('');

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile) {
            return;
        }

        // Check file type
        const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
        if (fileType !== "csv" && fileType !== "xlsx") {
            return;
        }

        const fileReader = new FileReader();
        if (fileType === 'csv') {
            fileReader.readAsBinaryString(selectedFile);
            fileReader.onload = async () => {
                const csvData = fileReader.result as string;

                if (csvData) {
                    importParsedData(csvData)
                }
            };
        } else if (fileType === 'xlsx') {
            fileReader.readAsArrayBuffer(selectedFile);
            fileReader.onload = async () => {
                const arrayBuffer = fileReader.result as ArrayBuffer;
                const data = new Uint8Array(arrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });

                // Assuming there's only one sheet in the XLSX file
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert XLSX sheet to CSV format or handle the data as required
                const csvContent = XLSX.utils.sheet_to_csv(sheet);
                if (csvContent) {
                    importParsedData(csvContent)
                }
            };
        }
    };

    const importParsedData = async (parsedData: string) => {
        leadService.importLeads([parsedData]).then((response) => {
            if (response.data) {
                setFailedLeads(response.data.invalidLeads)
                setPostedLeads(response.data.postedLeads)
                setDuplicatedLeads(response.data.duplicatedLeads)
                setFailedParsingLeads(response.data.failedParsingLeads)
                setXLSXData('')
                setSelectedFile(null)
            }
        })
    }

    useEffect(() => {
        // Function to convert the array of leads to a CSV string
        const convertLeadsToXLSX = async () => {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([
                ['Name', 'Phone Number', 'Email Address', 'Address', 'City', 'State', 'Zip Code', 'County', 'Private Notes']
            ]);

            const failedLeadsData = [...failedLeads, ...failedParsingLeads].map((lead) => Object.values(lead).map(value => value ?? ''));

            failedLeadsData.forEach((lead) => {
                XLSX.utils.sheet_add_aoa(ws, [lead], { origin: -1 });
            });

            XLSX.utils.book_append_sheet(wb, ws, 'Failed Leads');
            const xlsxContent = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
            setXLSXData(xlsxContent);
        };

        convertLeadsToXLSX();
    }, [failedLeads, failedParsingLeads]);

    // Function to convert the string to an ArrayBuffer
    const s2ab = (s:string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    };

    // Update the function to download XLSX file
    const downloadXLSXFile = () => {
        const blob = new Blob([s2ab(XLSXData)], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'failed-leads.xlsx');
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setXLSXData('');
        setFailedLeads([]);
        setFailedParsingLeads([]);
        setSelectedFile(null);
    };

    return (
        <>
            <Button
                variant="contained"
                onClick={()=> {
                    setOpenModal(!openModal)
                }} // Open the modal on button click
                sx={{ backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)', color: '#000000', fontSize: '13px', mx: 0, height: '30px', marginLeft: 'auto' }}
            >
                UPLOAD CSV
            </Button>
            <Dialog fullWidth open={openModal} onClose={()=>{
                setOpenModal(!openModal)
            }}>
                <DialogTitle sx={{ textAlign:'center', fontWeight: '800' }}>Import Leads</DialogTitle>
                <DialogContent sx={{ minWidth:'50%' }} >
                    <form className={ style.form } onSubmit={ onSubmit }>
                        <div className={ selectedFile ? style.fileUpload + ' ' + style.hasItem : style.fileUpload }>
                            <FontAwesomeIcon className={ style.icon } icon={ faCloudArrowUp } />
                            <h3>Click here to upload</h3>
                            <p>Maximum file size 10mb</p>
                            { selectedFile && <p>{ selectedFile.name }</p> }
                            <input type="file" onChange={ onFileChange } />
                        </div>
                        <Button
                            variant="contained"
                            type='submit' // Open the modal on button click
                            sx={{ backgroundImage:selectedFile === null ? '' : 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)', color: '#000000', fontSize: '13px', mx: 0, height: '30px', mt:2 }}
                            disabled={ selectedFile === null }
                        >Upload</Button>
                    </form>
                </DialogContent>
                {
                    failedLeads.length === 0 && postedLeads === 0 && duplicatedLeads.length === 0
                        ? null
                        : <DialogContent sx={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap: 2, mt:0, pt:0 }} >
                            {!postedLeads
                                ? null
                                : <Typography>Good job! {postedLeads} leads successfully imported.</Typography>
                            }
                            {!duplicatedLeads.length
                                ? null
                                : <Typography>{duplicatedLeads.length} leads were rejected to avoid duplication.</Typography>
                            }
                            {!failedLeads.length || failedParsingLeads.length
                                ? null
                                : <Typography sx={{textAlign: 'center'}}>{failedLeads.length} leads failed validation and
                                    were not imported. Click the button below to download a CSV including these leads, and then
                                    re-upload when fixed.</Typography>
                            }
                            {!failedParsingLeads.length || failedLeads.length
                                ? null
                                : <Typography sx={{textAlign: 'center'}}>{failedParsingLeads.length} leads failed parsing and
                                    could not be imported.</Typography>
                            }
                            {!failedParsingLeads.length || !failedLeads.length
                                ? null
                                : <Typography sx={{textAlign: 'center'}}>Some Leads could not be uploaded. First {failedLeads.length} have validation errors, and last {failedParsingLeads.length} have parsing errors. </Typography>
                            }
                            {!failedLeads.length && !failedParsingLeads.length
                                ? null
                                : <Button
                                    sx={{ backgroundImage: 'linear-gradient(180deg, #FFD056 0%, #FF800B 100%)', color: '#000000', fontSize: '13px', mx: 0, height: '30px' }}
                                    onClick={ downloadXLSXFile }
                                >Download XLSX</Button>
                            }
                        </DialogContent>
                }
            </Dialog>
        </>
    );
};

export default ImportLeads;
