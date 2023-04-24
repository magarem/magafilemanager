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
import { createServerClient } from '@supabase/auth-helpers-remix'
// import type { LoaderArgs } from '@remix-run/node' // change this import to whatever runtime you are using

const CDNURL = "https://jrppesgzrtbbqriuypku.supabase.co/storage/v1/object/public/files/";
// const supabase = createClient('https://jrppesgzrtbbqriuypku.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycHBlc2d6cnRiYnFyaXV5cGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMjYwMDksImV4cCI6MTk5NzYwMjAwOX0.mVBmQ2FuHX5r4vfrsllMAVZJrrIb3Bx-HjJWyz3HNCo', {
//     db: {
//       schema: 'custom',
//     },
//     auth: {
//       persistSession: true,
//     },
//   })

// const supabaseUrl = 'https://jrppesgzrtbbqriuypku.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycHBlc2d6cnRiYnFyaXV5cGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMjYwMDksImV4cCI6MTk5NzYwMjAwOX0.mVBmQ2FuHX5r4vfrsllMAVZJrrIb3Bx-HjJWyz3HNCo'//process.env.SUPABASE_KEY
// const supabase = createClient(supabaseUrl, supabaseKey)


// export const loader = async ({ request }: LoaderArgs) => {
//     const response = new Response()
//     const supabase = createServerClient(
//       process.env.SUPABASE_URL!,
//       process.env.SUPABASE_ANON_KEY!,
//       { request, response }
//     )
//     const userId = await getUserId(request);
//     console.log("userID:", userId);
    
//     const {data: { session }} = await supabase.auth.getSession()

//     console.log("session:", session?.user);
//     // const { data } = await supabaseClient.from('test').select('*')
//     // 
//     return json(
//       { userId: userId,
//         supabase},
//       {
//         headers: response.headers,
//       }
//     )
//   }

export const loader = async ({request}: LoaderArgs) => {
    const userId = await getUserId(request);
    const env = {
      SUPABASE_URL_RAW: process.env.SUPABASE_URL_RAW!,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    }
  
    return json({ userId, env })
  }

// export async function loader({ request }: LoaderArgs) {
//     const userId = await getUserId(request);
//     console.log(1, userId);
//     return json({userId: userId});
// }

export default function imagemanager() {
    // let submit = useSubmit();
    const data = useLoaderData<typeof loader>();
    const [ url, setUrl ] = useState("");
    const urlRef = React.useRef<HTMLTextAreaElement>(null);
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
    const [folderCopyAction, setFolderCopyAction] = useState('');
    const [selectFile, setSelectFile] = useState('');

    const bucket = 'files'


    const supabase = createClient(data.env.SUPABASE_URL_RAW, data.env.SUPABASE_ANON_KEY, {
        db: {
            schema: 'custom',
        },
        auth: {
            persistSession: true,
        },
    })

    useEffect(() => {
        // setUser(data.userId);
        list_files("","")
    },[])

    useEffect(() => {
        // alert('!')
        console.log(url);
        (urlRef as any).current.value = url
        
         // if (url[0]=='/') setUrl(url.substring(1))
        // list_files(url)
    },[url])

    const handleFileSelected = (e) => {
        setfile(e.target.files[0]);
        console.log("!");
        // submit(formUploadRef)
    };

    const list_files = async (url_: any, folder: any) => {
        setUrl('')
        console.log(user, url_, folder);
        setFilesData([])
       
        let target
        if (url_==''&&folder==''){
            target = user
        }
        if (url_==''&&folder!==''){
            setUrl(folder)
            target = user + '/' + folder
        }
        if (url_!==''&&folder!==''){
            setUrl(url_ + '/' + folder)
            target =  user + '/' + url_ + '/' + folder
        }

        
        
        // url = user + '/' + url
        // a = a.replace("//","/")
       
        // let url_ =  '/' + a
        
        // if (url_=='/'){
        //     url_ = ''
        // }

        // setUrl(a)
        console.log('target:', target);
        
        // setUrl(url);
    
        // let url_ = user + a
        // if (url_[0]=='/') url_ = url_.substring(1)
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .list(target, {
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
          .from(bucket)
          .upload(user + '/' + url + '/' + filename, file, {
            cacheControl: "3600",
            upsert: false,
          });
          list_files('', url)
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
        console.log(user + '/' + bb, user + '/' + cc);
        
        let origem = (bb[0]=='/')? user + bb : user + '/' + bb
        let destino = (cc[0]=='/')? user + cc : user + '/' + cc
        
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .move(origem, destino)
            console.log(error);
        setShowRenomear(false)
        setUrl(cc)
        // list_files(bb, cc)
    };

    const newFolder = async (name) => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(user + '/' + url + '/' + name + '/.initial', '', {
            cacheControl: "3600",
            upsert: false,
          });
          list_files('', url)
    }

    const deleteFolder = async ()  => {
        console.log('::', user + url + '/*');
        if (confirm('Confirma exclusão da pasta:' + url)){
            const { data, error } = await supabase
            .storage
            .from(bucket)
            .remove([user + '/' + url + '/.initial'])
            console.log(data, error);
            if(error) {
            alert(error);
            } else {
            back()
            }
        }   
    }

    const deleteImage = async (imageName)  => {
        console.log(imageName);
        if (confirm('Confirma exclusão do arquivo:' + imageName)){
          const { data, error } = await supabase
        .storage
        .from(bucket)
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

    const handleClick = event => {
        if (event.detail === 2) {
          console.log('double click');
        }
      };
      
    const goUrl = async () => {
        // console.log("!");
        (urlRef as any).current.value = ''
        setUrl(urlRef.current.value)
        // if (url[0]=='/') setUrl(url.substring(1))
        // list_files()
    }

    const goHome = async () => {
        (urlRef as any).current.value = ''
        // setUrl("")
        setUrlType('folder')
        list_files("","")
    }

    const back = async () => {
        let a = url.split('/')
        let b = a.slice(0,-1).join('/')
        // setUrl(b)
        list_files('', b)
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

    const folderCopyDo = async () => {
       
        // let fileCopyAction_ = fileCopyAction
        // let fileName = fileCopyAction_.split('/').pop()
        console.log('folderCopyDo:', user + '/' + folderCopyAction, user + '/' + url);  
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .copy(user + '/' + folderCopyAction, user + '/' + url)
            console.log(error);
            setFolderCopyAction('')
            list_files('', url)
    }

    const fileCopyDo = async () => {
       
        let fileCopyAction_ = fileCopyAction
        let fileName = fileCopyAction_.split('/').pop()
        console.log('fileCopyDo:', user + fileCopyAction, user + '/' + url + '/' + fileName);  
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .copy(user + fileCopyAction, user + '/' + url + '/' + fileName)
            console.log(error);
            setFileCopyAction('')
            list_files('', url)
    }

    const movePaste = async () => {
        let selectFile_ = selectFile
        let fileName = selectFile_.split('/').pop()
        console.log(user + selectFile, user + url + '/' + fileName);
        
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .move(user + selectFile, user + '/' + url + '/' + fileName)
            console.log(error);
            setSelectFile('')
            list_files('', url)
    }

    return (
        <div >
            
            <div className=' text-white pt-10 text-center' style={{width: '80%', margin: 'auto'}}>
                <h3>Gerenciador de arquivos</h3>
                user: {user} url: {url} bucket: {bucket}<br/>
                selectFile:{selectFile} fileCopyAction: {fileCopyAction}<br/>
                folderCopyAction: {folderCopyAction}

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
                            <Button variant="primary" onClick={() =>  navigator.clipboard.writeText(data.env.SUPABASE_URL_RAW + '/storage/v1/object/public/files/' + user + '/' + urlRef.current.value)}>
                                <TfiClipboard/>
                            </Button>
                        </InputGroup.Text>
                    }
                    {(urlType=="folder"||url==""||url=="/")&&
                        <DropdownButton
                        as={ButtonGroup}
                        title="Comandos"
                        id="bg-vertical-dropdown-1"
                        >
                        {/* {folderCopyAction?
                            <Dropdown.Item eventKey="5" onClick={() => folderCopyDo()}>Colar pasta</Dropdown.Item>
                            :
                            <Dropdown.Item eventKey="5" onClick={() => setFolderCopyAction(url)}>Copiar pasta</Dropdown.Item>
                        }  */}

                        {urlType=="folder"&&fileCopyAction&&
                            <Dropdown.Item eventKey="3" onClick={() => fileCopyDo()}>Colar</Dropdown.Item>
                        }
                        
                        {urlType=="folder"&&selectFile&&
                            <Dropdown.Item eventKey="3" onClick={() => movePaste()}>Colar</Dropdown.Item>
                        }

                        <Dropdown.Item eventKey="1" onClick={() => goNewFolder()}>Nova pasta</Dropdown.Item>
                        <Dropdown.Item eventKey="2" onClick={() => goUpload()}>Enviar arquivo</Dropdown.Item>
                        <Dropdown.Item eventKey="3" onClick={() => deleteFolder()}>Excluir pasta</Dropdown.Item>
                        </DropdownButton>
                    }
                    {(urlType=="img")&&
                        <DropdownButton
                            as={ButtonGroup}
                            title="Comandos"
                            id="bg-vertical-dropdown-1"
                        >
                            <Dropdown.Item eventKey="4" onClick={() => setShowRenomear(true)}>Renomear arquivo</Dropdown.Item>
                            {!fileCopyAction&&
                                <Dropdown.Item eventKey="5" onClick={() => setFileCopyAction(url)}>Copiar arquivo</Dropdown.Item>
                            }
                            {!selectFile&&
                                <Dropdown.Item eventKey="6" onClick={() => setSelectFile(url)}>Cortar arquivo</Dropdown.Item>
                            }
                            <Dropdown.Item eventKey="6" onClick={() => goDelete()}>Excluir arquivo</Dropdown.Item>
                        </DropdownButton>
                    }
                </InputGroup>
                <br/>
                {/* {urlType=="folder"&&fileCopyAction&&
                    <Button variant="secondary" onClick={() => fileCopyDo()}>
                        Colar
                    </Button>
                }

                {urlType=="folder"&&selectFile&&
                    <Button  variant="secondary" onClick={() => movePaste()}>
                        Colar
                    </Button>
                } */}

                <Row xs={1} md={4} className="g-4">
                {urlType!=='img'&&filesData.filter((x)=>!x.name.includes('undefined')&&x.name!=='.initial').map((image) => {
                    return (
                    <Col key={CDNURL + "/" + image.name}>
                     {!image.id?
                            <Card style={{backgroundColor: '#19376D'}} onClick={() => { setUrlType('folder'); list_files(url, image.name)}}>
                                {/* <Card.Img variant="top" src="/img/folder2.png" style={{width: '50', height: '30'}} onClick={() => {setUrl(url + '/' + image.name); }} /> */}
                                <Card.Body>
                                {/* <Button onClick={() => { setUrlType('folder'); list_files(url, image.name)}}> */}
                                    <img src="/img/folder2.png"  alt=""/>
                                {/* </Button> */}
                                   
                                    <InputGroup className="mb-3 pl-2" style={{color: 'white'}}>
                                        {image.name}
                                        {/* <InputGroup.Text id="basic-addon1">{image.name}</InputGroup.Text> */}
                                    </InputGroup>   
                                    {/* <Button key={CDNURL + "/" + image.name} variant="danger" onClick={() => deleteImage(image.name)}>Delete Image</Button> */}
                                </Card.Body>
                            </Card>
                        :
                        <Card>
                            <Card.Img variant="top" style={{width: '50vw', height: '38vh', objectFit: 'cover'}} src={CDNURL + "/" + user + '/' + url + '/' + image.name} onClick={() => {setUrlType('img'); setUrl(url + '/' + image.name)}} />
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
                    {/* <div className='w-100 d-flex justify-content-center mb-3'>
                    <ButtonGroup aria-label="Basic example">
                        <Button variant="secondary" onClick={() => setShowRenomear(true)}>
                            Renomear
                        </Button>
                        {!fileCopyAction&&
                        <Button  variant="secondary" onClick={() => setFileCopyAction(url)}>
                            Copiar
                        </Button>
                        }
                        {!selectFile&&
                        <Button  variant="secondary" onClick={() => setSelectFile(url)}>
                            Cortar
                        </Button>
                        }
                        <Button variant="danger" onClick={() => goDelete()}>
                            Excluir  
                        </Button>
                    </ButtonGroup>
                    </div> */}
                        
                        <div className='w-100 d-flex justify-content-center mt-2 mb-4'>
                            <img src={CDNURL + "/" +user + '/' + url} />
                        </div>
                        

                    </>
                }
                </div>


                
            </div>
        </div>
    )
}