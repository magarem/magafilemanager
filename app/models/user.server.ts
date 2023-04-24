import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jrppesgzrtbbqriuypku.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycHBlc2d6cnRiYnFyaXV5cGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMjYwMDksImV4cCI6MTk5NzYwMjAwOX0.mVBmQ2FuHX5r4vfrsllMAVZJrrIb3Bx-HjJWyz3HNCo'//process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Access auth admin api
const adminAuthClient = supabase.auth.admin

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  console.log('id:', id);
  
  return await prisma.user.findUnique({ where: { id } })||[];
}

export async function getUserByEmail(email: User["email"]) {
  console.log('email:', email);
  return await prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: hashedPassword,
    user_metadata: { name: 'Yoda' }
  })

  
  

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  console.log('user.id:', user.id);

  const { data2, error2 } = await supabase.storage
  .from('files')
  .upload(user.id + '/.initial', '', {
    cacheControl: "3600",
    upsert: false,
  });
  
  // const { data2, error2 } = await supabase
  // .storage
  // .createBucket(user.id, {
  //   public: true,
  //   allowedMimeTypes: ['image/jpeg', 'image/png', 'image/bmp']
  // })

  console.log('data2:', data2);

  return user
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
