function(doc, req) {
         if (!doc) {
            if (req.id) {
              return [{
                _id : req.id
              }, 'New World']
           }
           return [{_id: req.uuid, name: req.form.name, location: req.form.location, 
			date: req.form.date, amount: req.form.amount, created_on: JSON.stringify(new Date())}, "Doc created"];
         }
         return [null, 'Error: document exists'];
      }
