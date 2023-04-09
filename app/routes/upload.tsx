import { useState } from "react";
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from "uuid";
export const supabase = createClient('https://lpbqbqcmlspixeiikhcb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYnFicWNtbHNwaXhlaWlraGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA2NDU1ODksImV4cCI6MTk5NjIyMTU4OX0.EIGOPYgY4iebJJ1jpJNCoioJZSE9XU83ZPWUhCsgUSk')

export default function Page() {
  const [file, setfile] = useState([]);

  const handleSubmit = async (e: any) => {
        e.preventDefault();
        const filename = `${uuidv4()}-${file.name}`;
    
        const { data, error } = await supabase.storage
          .from("files")
          .upload(filename, file, {
            cacheControl: "3600",
            upsert: false,
          });
    
        const filepath = data.path;
        // save filepath in database
  };

  const handleFileSelected = (e) => {
    setfile(e.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="image" onChange={handleFileSelected} />
      <br/>
      <button type="submit">Upload image</button>
    </form>
  );
}