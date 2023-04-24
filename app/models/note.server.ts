import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";
var fs = require("fs");
export type { Note } from "@prisma/client";

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, img: true, title: true },
    where: { id, userId },
  });
}

export async function getNoteListItems({ userId }: { userId: User["id"] }) {
  console.log('userId', userId);
  
  return await prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  })||[];
}

export function updateNote(obj: object & {userId: User["id"]}) {
  // var writeStream = fs.createWriteStream("data/" + title + ".md");
  // writeStream.write(body);
  // writeStream.write("Thank You.");
  // writeStream.end();
  return prisma.note.update({
    where: {
      id: obj.id
    },
    data: obj
  })
}

function generateUID() {
  // I generate the UID from two parts here 
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

const geraDate = () => new Date().toLocaleDateString()

function adicionaZero(numero){
  if (numero <= 9) 
      return "0" + numero;
  else
      return numero; 
}

let dataAtual = new Date(); //29/01/2020
let dataAtualFormatada = (adicionaZero(dataAtual.getDate().toString()) + (adicionaZero(dataAtual.getMonth()+1).toString()) + dataAtual.getFullYear())
console.log(dataAtualFormatada);

const slugify = str =>
  str
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')

export function createNote({
  body,
  title,
  img,
  userId,
}: Pick<Note, "body" | "title" | "img"> & {
  userId: User["id"];
}) {

  // var name = "data/" + generateUID() + '_' + dataAtualFormatada + '__' + slugify(title) + ".md"
  // console.log(name);
 
  // var writeStream = fs.createWriteStream(name);
  // writeStream.write(body);
  // writeStream.write("Thank You.");
  // writeStream.end();
  return prisma.note.create({
    data: {
      title,
      body,
      img,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}
