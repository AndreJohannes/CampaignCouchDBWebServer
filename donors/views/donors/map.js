function(doc) {
  if (doc.name) {
      emit(doc.created_on,
           [doc._id, doc._rev ,doc.name,
	doc.location,doc.date, doc.amount]
   );
  }
};

