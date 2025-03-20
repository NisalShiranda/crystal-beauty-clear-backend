function getStudents(password) {
    console.log("Creating Function");
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password == "abc") {
          resolve([
            {
              name: "Rahul",
              age: 25,
            },
            {
              name: "Raj",
              age: 26,
            },
          ]);
        } else {
          reject("Wrong Password");
        }
      }, 5000);
    });
    return p;
  }
  
  async function run() {
    try {
      const run = await getStudents("123");
      console.log(run);
    } catch (err) {
      console.log(err);
    }
  }
  
  run();
  