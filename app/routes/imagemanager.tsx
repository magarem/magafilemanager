import { useEffect, useState } from 'react';
import { useSubmit } from "react-router-dom";
import { Row, Col, Card, Form, InputGroup, ButtonGroup, Container, DropdownButton, Dropdown } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { createClient } from '@supabase/supabase-js'
import { json } from "@remix-run/node";
import React from 'react';
import { v4 as uuidv4 } from "uuid";
import { ActionArgs, LoaderArgs } from '@remix-run/server-runtime';
import { getUserId } from "../session.server";
import  Modal  from "../components/modal"
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { TfiHome , TfiArrowCircleLeft, TfiClipboard, TfiArrowCircleRight} from "react-icons/tfi";
import { FiFolderPlus } from "react-icons/fi";
import { RiFolderUploadLine } from "react-icons/ri";
const CDNURL = "https://lpbqbqcmlspixeiikhcb.supabase.co/storage/v1/object/public/files/";
const supabase = createClient('https://lpbqbqcmlspixeiikhcb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYnFicWNtbHNwaXhlaWlraGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA2NDU1ODksImV4cCI6MTk5NjIyMTU4OX0.EIGOPYgY4iebJJ1jpJNCoioJZSE9XU83ZPWUhCsgUSk', {
    db: {
      schema: 'custom',
    },
    auth: {
      persistSession: true,
    },
  })

export async function loader({ request }: LoaderArgs) {
    const userId = await getUserId(request);
    console.log(1, userId);
    return json({userId: userId});
}

export default function imagemanager() {
    let submit = useSubmit();
    const data = useLoaderData<typeof loader>();
    const [ url, setUrl ] = useState("");
    const urlRef = React.useRef<HTMLTextAreaElement>(url);
    const formUploadRef = React.useRef<HTMLTextAreaElement>(null);
    const fileNewNameRef = React.useRef<HTMLTextAreaElement>(null);
    const [filesData, setFilesData] = useState([]);
    const [file, setfile] = useState([]);
    const [user, setUser] = useState(data.userId);
    const [urlType, setUrlType] = useState('');
    const newFolderRef = React.useRef<HTMLTextAreaElement>(null);
    const uploadTxtRef = React.useRef<HTMLTextAreaElement>(null);
    const [show, setShow] = useState(false);
    const [showRenomear, setShowRenomear] = useState(false);
    const [fileCopyAction, setFileCopyAction] = useState('');
    
    
    useEffect(() => {
        // setUser(data.userId);
        list_files()
    },[])

    useEffect(() => {
        console.log(url);
        list_files()
    },[url])

    const handleFileSelected = (e) => {
        setfile(e.target.files[0]);
        console.log("!");
        // submit(formUploadRef)
    };



    const list_files = async () => {
        
        console.log(user, url);

        const { data, error } = await supabase
          .storage
          .from('files')
          .list(user + url, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          })
      
        console.log(data);
        
        setFilesData(data)
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const filename = `${uuidv4()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("files")
          .upload(user + '/' + url + '/' + filename, file, {
            cacheControl: "3600",
            upsert: false,
          });
          list_files(user)
          setShow(false)
    };

    const handleSubmit_rename = async (e: any) => {
        e.preventDefault();
        let url_ = url
        let a = url_.split('/')
        a.pop()
        let b = a.join('/')

        let bb = url
        let cc = b + '/' + fileNewNameRef.current?.value

        console.log('rename:', bb, cc);
        const { data, error } = await supabase
            .storage
            .from('files')
            .move(user + bb, user + cc)
            console.log(error);
        setShowRenomear(false)
        setUrl(cc)
    };

    const newFolder = async (name) => {
        const { data, error } = await supabase.storage
          .from("files")
          .upload(user + '/' + url + '/' + name + '/.initial', '', {
            cacheControl: "3600",
            upsert: false,
          });
          list_files(user)
    }

    const deleteImage = async (imageName)  => {
        console.log(imageName);
        if (confirm('Confirma exclusão do arquivo:' + imageName)){
          const { data, error } = await supabase
        .storage
        .from('files')
        .remove([user + url])
      
        // const { data, error } = await supabase
        //   .storage
        //   .from('files')
        //   .remove(['005df6c1-5a87-4594-a00e-f2e10f6ef6f0-vestido-casual-16.jpg'])
        console.log(data, error);
        
        if(error) {
          alert(error);
        } else {
        // let a = url.split('/').pop()
        // alert(a)
        back()
        // setUrl(a.join('/'))
        //   list_files(user);
        }
        }
        
    }

    const copy = async () => {
        await navigator.clipboard.writeText(url);
        alert('Text copied');
    }

    const goUrl = async () => {
        setUrl(urlRef.current?.value)
    }

    const goHome = async () => {
        setUrl("")
        setUrlType('folder')
    }

    const back = async () => {
        let a = url.split('/')
        let b = a.slice(0,-1).join('/')
        setUrl(b)
        setUrlType('folder')
    }

    const goNewFolder = () => {
       let a = prompt("Nome da pasta")
       newFolder(a)
    }

    const goDelete = () => {
        deleteImage(url)
    }

    const goUpload = () => {
        setShow(true)
        console.log(show);    
    }

    const fileCopyDo = async () => {
        // let url_ = url
        // url_.split('/').pop()
        // url_ = url_.join('/')
        console.log(user + fileCopyAction, user + url + fileCopyAction);
        
        const { data, error } = await supabase
            .storage
            .from('files')
            .copy(user + fileCopyAction, user + url + fileCopyAction)
            console.log(error);
        fileCopyAction('')
        //setShowRenomear(false)
        //setUrl(cc)
    }

    return (
        <div >
            <div className=' text-white ' style={{width: '80%', margin: 'auto', marginTop: '10px'}}>
                <h2>Gerenciador de arquivos</h2>
            </div>
           
            {/* <h1>File manager</h1>{url}[{urlType}]<br/> */}
            {/* <Modal title="Copiar arquivo" show={showCopiar} setShow={setShowCopiar} showFooterButtons={false}>
                <Form
                   
                    name="form_copiar"
                    method="post"
                    onSubmit={handleSubmit_copy}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        width: "100%",
                    }}
                    >
                    <div>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Digite o novo nome</Form.Label>
                            <Form.Control type="text" ref={fileNewNameRef} defaultValue={url.split('/').pop()}  name="fileNewName"/>
                        </Form.Group>
                        <button
                            type="submit"
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                            >
                            Renomear arquivo
                        </button>
                    </div>
                </Form>
            </Modal> */}
            <Modal title="Renomear arquivo" show={showRenomear} setShow={setShowRenomear} showFooterButtons={false}>
                <Form
                   
                    name="form_rename"
                    method="post"
                    onSubmit={handleSubmit_rename}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        width: "100%",
                    }}
                    >
                    <div>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Digite o novo nome</Form.Label>
                            <Form.Control type="text" ref={fileNewNameRef} defaultValue={url.split('/').pop()}  name="fileNewName"/>
                        </Form.Group>
                        <button
                            type="submit"
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                            >
                            Renomear arquivo
                        </button>
                    </div>
                </Form>
            </Modal>
            <Modal title="Enviar arquivo" show={show} setShow={setShow} showFooterButtons={false}>
                <Form
                    ref={formUploadRef}
                    name="form1"
                    method="post"
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        width: "100%",
                    }}
                    >
                    <div>
                        {/* Nova pasta: <input type="text" ref={newFolderRef} name="newfolder" />
                        <button
                            onClick={()=>{newFolder()}}
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                            >
                            Nova pasta
                        </button> */}
                        <Form.Group controlId="formFileSm" className="mb-3">
                          {/* <Form.Label>Upload</Form.Label> */}
                          <Form.Control type="file" size="sm" name="image" onChange={(event)=>handleFileSelected(event)} accept="image"/>
                        </Form.Group>
                        {/* <label className="flex w-full flex-col gap-1">
                        <span>Img: </span>
                        <input type="file"  />
                        </label> */}
                        <button
                            type="submit"
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
                            >
                            Enviar arquivo
                        </button>
                    </div>
                </Form>
            </Modal>
            {/* <Button variant="primary" onClick={()=>teste()}>
              vai!
            </Button> */}
            {uploadTxtRef.current?.value}
            <div style={{width: '80%', margin: 'auto', marginTop: '10px'}}>
                <InputGroup className="mb-3">
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() => goHome()}>
                          <TfiHome/>
                        </Button>
                    </InputGroup.Text>
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() => back()}>
                            <TfiArrowCircleLeft/>
                        </Button>
                    </InputGroup.Text>
                    <Form.Control
                        name="url" 
                        ref={urlRef}
                        defaultValue={url}
                    /> 
                    
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() => goUrl()}>
                            <TfiArrowCircleRight/>
                        </Button>
                    </InputGroup.Text>
                    {(urlType=="img")&&
                    <InputGroup.Text>
                        <Button variant="primary" onClick={() =>  navigator.clipboard.writeText(urlRef.current.value)}>
                            <TfiClipboard/>
                        </Button>
                    </InputGroup.Text>
                    }
                    {(urlType=="folder")&&
                        <>
                        <DropdownButton
                            as={ButtonGroup}
                            title="Comandos"
                            id="bg-vertical-dropdown-1"
                        >
                            <Dropdown.Item eventKey="1" onClick={() => goNewFolder()}>Nova pasta</Dropdown.Item>
                            <Dropdown.Item eventKey="2" onClick={() => goUpload()}>Enviar arquivo</Dropdown.Item>
                        </DropdownButton>
                        </>
                    }
                  
                </InputGroup>
                <br/>
                {fileCopyAction&&
                        <Button  variant="secondary" onClick={() => fileCopyDo()}>
                            Colar
                        </Button>
                        }
                <Row xs={1} md={4} className="g-4">
                {urlType!=='file'&&filesData.filter((x)=>!x.name.includes('undefined')&&x.name!=='.initial').map((image) => {
                    return (
                    <Col key={CDNURL + "/" + image.name}>
                     {!image.id?
                        <Card style={{backgroundColor: '#19376D'}}>
                            {/* <Card.Img variant="top" src="/img/folder2.png" style={{width: '50', height: '30'}} onClick={() => {setUrl(url + '/' + image.name); }} /> */}
                            <Card.Body>
                                <img src="/img/folder2.png" onClick={() => {setUrl(url + '/' + image.name); setUrlType('folder')}}  alt=""/>
                                <InputGroup className="mb-3 pl-2" style={{color: 'white'}}>
                                    {image.name}
                                    {/* <InputGroup.Text id="basic-addon1">{image.name}</InputGroup.Text> */}
                                </InputGroup>   
                                {/* <Button key={CDNURL + "/" + image.name} variant="danger" onClick={() => deleteImage(image.name)}>Delete Image</Button> */}
                            </Card.Body>
                        </Card>
                        :
                        <Card>
                            <Card.Img variant="top" style={{width: '50vw', height: '30vh', objectFit: 'cover'}} src={CDNURL + "/" + user + '/' + url + '/' + image.name} onClick={() => {setUrlType('img'); setUrl(url + '/' + image.name)}} />
                            {/* <Card.Body> */}
                                {/* <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon1">URL</InputGroup.Text>
                                        <Form.Control
                                            name="url"
                                            defaultValue={`${image.name}`}
                                        />
                                </InputGroup>    */}
                                {/* <Button key={CDNURL + "/" + image.name} variant="danger" onClick={() => deleteImage(image.name)}>Delete Image</Button> */}
                            {/* </Card.Body> */}
                        </Card>
                     }
                    </Col>
                    )
                })}
                </Row>
                <div>
                {urlType=='img'&&
                    <>
                    <div className='w-100 d-flex justify-content-center mb-3'>
                    <ButtonGroup aria-label="Basic example">
                        <Button variant="secondary" onClick={() => setShowRenomear(true)}>
                            Renomear
                        </Button>
                        {!fileCopyAction&&
                        <Button  variant="secondary" onClick={() => setFileCopyAction(url)}>
                            Copiar
                        </Button>
                        }
                        
                        <Button variant="secondary" onClick={() => goDelete()}>
                            Mover
                        </Button> 
                        <Button variant="danger" onClick={() => goDelete()}>
                            Excluir  
                        </Button>
                    </ButtonGroup>
                    </div>
                        
                        <div className='w-100 d-flex justify-content-center'>
                            <img src={CDNURL + "/" +user + '/' + url} />
                        </div>
                    </>
                }
                </div>


                
            </div>
        </div>
    )
}