package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.SupplierRequest;
import com.ezeiatech.inventory.dto.SupplierResponse;
import com.ezeiatech.inventory.entity.Supplier;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierResponse create(SupplierRequest request){
        String email = request.getEmail().trim().toLowerCase();

        if(supplierRepository.existsByEmail(email)){
            throw new ApiException(HttpStatus.CONFLICT, "Supplier email already exists");
        }

        Supplier supplier = new Supplier();
        apply(supplier,request,email);
        return SupplierResponse.from(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request){
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND,"Supplier not found"));
        String email = request.getEmail().trim().toLowerCase();
        if (supplierRepository.existsByEmailAndIdNot(email, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "Supplier email already exists");
        }
        apply(supplier, request, email);
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }
        return SupplierResponse.from(supplierRepository.save(supplier));
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAll() {
        return supplierRepository.findAll().stream().map(SupplierResponse::from).toList();
    }

    private void apply(Supplier supplier, SupplierRequest request, String email) {
        supplier.setName(request.getName().trim());
        supplier.setEmail(email);
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
    }
}
